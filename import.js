require('dotenv').config();

const fs = require('fs');

const { parse } = require('csv-parse');
const { Client } = require('@elastic/elasticsearch')

const types = {
  // Filer information
  FILER_ID: 'long',
  FILER_PREVIOUS_ID: 'keyword',
  CAND_COMM_NAME: 'text',
  ELECTION_YEAR: 'integer',
  ELECTION_TYPE: 'keyword',
  COUNTY_DESC: 'text',
  FILING_ABBREV: 'keyword',
  FILING_DESC: 'keyword',
  R_AMEND: 'boolean',
  FILING_CAT_DESC: 'keyword',
  FILING_SCHED_ABBREV: 'keyword',
  FILING_SCHED_DESC: 'keyword',
  LOAN_LIB_NUMBER: 'keyword',
  TRANS_NUMBER: 'keyword',
  TRANS_MAPPING: 'keyword',
  SCHED_DATE: 'date',
  ORG_DATE: 'date',
  CNTRBR_TYPE_DESC: 'keyword',
  CNTRBN_TYPE_DESC: 'keyword',
  TRANSFER_TYPE_DESC: 'keyword',
  RECEIPT_TYPE_DESC: 'keyword',
  RECEIPT_CODE_DESC: 'keyword',
  PURPOSE_CODE_DESC: 'keyword',
  R_SUBCONTRACTOR: 'boolean',
  FLNG_ENT_NAME: 'text',
  FLNG_ENT_FIRST_NAME: 'text',
  FLNG_ENT_MIDDLE_NAME: 'text',
  FLNG_ENT_LAST_NAME: 'text',
  FLNG_ENT_ADD1: {
    type: 'text',
    analyzer: 'address_synonym_analyzer',
  },
  FLNG_ENT_CITY: 'text',
  FLNG_ENT_STATE: 'text',
  FLNG_ENT_ZIP: 'keyword',
  FLNG_ENT_COUNTRY: 'keyword',
  PAYMENT_TYPE_DESC: 'keyword',
  PAY_NUMBER: 'keyword',
  OWED_AMT: 'float',
  ORG_AMT: 'float',
  LOAN_OTHER_DESC: 'keyword',
  TRANS_EXPLNTN: 'text',
  R_ITEMIZED: 'boolean',
  R_LIABILITY: 'boolean',
  ELECTION_YEAR_R: 'integer',
  OFFICE_DESC: 'text',
  DISTRICT: 'keyword',
  DIST_OFF_CAND_BAL_PROP: 'text',

  // Candidate information
  COMPLIANCE_TYPE_DESC: 'keyword',
  FILER_TYPE_DESC: 'keyword',
  STATUS: 'keyword',
  COMMITTEE_TYPE_DESC: 'keyword',
  MUNICIPALITY_DESC: 'text',
  TREASURER_FIRST_NAME: 'text',
  TREASURER_MIDDLE_NAME: 'text',
  TREASURER_LAST_NAME: 'text',
  ADDRESS: {
    type: 'text',
    analyzer: 'address_synonym_analyzer',
  },
  CITY: 'text',
  STATE: 'keyword',
  ZIPCODE: 'keyword',

  // Computed fields
  _FLNG_ENT_FULL_NAME: 'text',
  _TREASURER_FULL_NAME: 'text',
}

const converters = {
  'long': parseInt,
  'integer': parseInt,
  'float': parseFloat,
  'date': Date.parse,
  'boolean': (value) => {
    // In this dataset, boolean values are either Y or N
    if (value === 'Y') {
      return true;
    } else if (value === 'N') {
      return false;
    } else {
      return undefined;
    }
  }
}

function combineParts(parts) {
  return parts.filter(part => part !== undefined && part.trim().length > 0)
              .join(' ')
              .trim();
}

async function run () {
  // Build the type mapping for ES
  const typeMapping = {};
  for (const [key, config] of Object.entries(types)) {
    if (typeof config === 'string') {
      typeMapping[key] = {type: config};
    } else {
      typeMapping[key] = config;
    }
  }

  // Build the ES client object
  console.error('Connecting to ElasticSearch');
  const client = new Client({
    node: 'https://localhost:9200',
    auth: {
      username: 'elastic',
      password: process.env.ELASTIC_PASSWORD
    },
    tls: {
      ca: fs.readFileSync('./ca.crt'),
      rejectUnauthorized: false
    }
  });

  // Delete any prexisting index
  console.error('Deleting old index');
  await client.indices.delete({
    index: process.env.REACT_APP_ES_INDEX,
    ignore_unavailable: true
  });


  // Create a new index with the appropriate mapping
  console.error('Creating index');
  await client.indices.create({
    index: process.env.REACT_APP_ES_INDEX,
    settings: {
      index: {
        analysis: {
          analyzer: {
            address_synonym_analyzer: {
              tokenizer: 'standard',
              filter: ['lowercase', 'address_synonym_filter'],
            }
          },
          filter: {
            address_synonym_filter: {
              type: 'synonym',
              synonyms_path: 'analysis/address_synonyms.txt',
            }
          }
        }
      }
    },
    mappings: {
      properties: typeMapping
    }
  });

  console.error('Parsing records');
  const parser = fs.createReadStream('./COUNTY_COMMITTEE_JOINED.csv').pipe(parse({
    on_record: (record) => {
      const newRecord = {};
      for (const key of Object.keys(record)) {
        // Apply any necessary converters
        const converter = converters[types[key]];
        const newValue = converter ? converter(record[key]) : record[key];

        // Only include the field if it has a valid value
        if (!Number.isNaN(newValue) && newValue !== "" && newValue !== undefined) {
          newRecord[key] = newValue;
        }
      }
      return newRecord;
    },
    columns: true
  }));

  let i = 0;
  let records = [];
  for await (const record of parser) {
    // Add the necessary elements for bulk update
    records.push({index: {_index: process.env.REACT_APP_ES_INDEX}})

    // Index the full treasurer name
    const treasurerName = combineParts([
      record['TREASURER_FIRST_NAME'],
      record['TREASURER_MIDDLE_NAME'],
      record['TREASURER_LAST_NAME']
    ])
    if (treasurerName) {
      record['_TREASURER_FULL_NAME'] = treasurerName;
    }

    // Get the full name of the filing entity if a person
    let fullName = combineParts([
      record['FLNG_ENT_FIRST_NAME'],
      record['FLNG_ENT_MIDDLE_NAME'],
      record['FLNG_ENT_LAST_NAME']
    ]);

    // Default to the organization name
    if (!fullName) {
      fullName = record['FLNG_ENT_NAME'];
    } else if (record['FLNG_ENT_NAME'] && record['FLNG_ENT_NAME'] !== fullName) {
      // We have both a person and an organization which are different
      fullName = `${record['FLNG_ENT_NAME']} (${fullName})`;
    }

    record['_FLNG_ENT_FULL_NAME'] = fullName;

    records.push(record);
    i += 1;

    // Add a batch of 100 records and update progress
    if (records.length >= 100 * 2) {
      await client.bulk({ operations: records });
      records = [];
      console.error(i);
    }
  }

  // Perform one final bulk update if needed
  if (records.length > 0) {
    await client.bulk({ operations: records });
  }

  // Refresh the index
  console.error('Refreshing index');
  await client.indices.refresh({ index: process.env.REACT_APP_ES_INDEX });
}

run().catch(console.log)
