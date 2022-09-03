require('dotenv').config();

const fs = require('fs');
const readline = require('readline');

const cliProgress = require('cli-progress');
const { parse } = require('csv-parse');
const { Client } = require('@elastic/elasticsearch')
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');

const TYPE_MAPPINGS = {
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

const CONVERTERS = {
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

async function createIndex(client) {
  // Build the type mapping for ES
  const typeMapping = {};
  for (const [key, config] of Object.entries(TYPE_MAPPINGS)) {
    if (typeof config === 'string') {
      // If we only have a string, use that as the type
      typeMapping[key] = {type: config};
    } else {
      // Otherwise, assume we hve an object for the entire mapping
      typeMapping[key] = config;
    }
  }

  // Create a new index with the appropriate mapping
  console.error('Creating index');
  return client.indices.create({
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
            // Add synonyms for address parts such as Road <=> Rd
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
}

async function deleteIndex(client) {
  console.error('Deleting old index');

  // Delete any prexisting index (if it exists)
  return client.indices.delete({
    index: process.env.REACT_APP_ES_INDEX,
    ignore_unavailable: true
  });
}

async function run () {
  const argv = yargs(hideBin(process.argv))
    .command('$0 <file>')
    .option('c', {
      alias: 'create-index',
      default: true,
      type: 'boolean'
    })
    .option('d', {
      alias: 'delete-index',
      default: false,
      type: 'boolean'
    })
    .argv;


  // Count the totial lines in the file
  const rl = readline.createInterface({
    input: fs.createReadStream(argv.file),
  });

  // Start at -1 so we implicitly don't count the header
  let totalRows = -1;
  // eslint-disable-next-line
  for await (const _line of rl) {
    totalRows += 1;
  }

  // Build the ES client object
  console.error('Connecting to ElasticSearch');
  const client = new Client({
    // node: process.env.REACT_APP_ES_URL,
    node: 'https://localhost:9200',
    auth: {
      username: 'elastic',
      password: process.env.ELASTIC_PASSWORD
    },
    tls: {
      ca: process.env.ES_CERT_PATH ? fs.readFileSync(process.env.ES_CERT_PATH) : undefined,
      rejectUnauthorized: !process.env.ES_ALLOW_UNAUTHORIZED || process.env.ES_ALLOW_UNAUTHORIZED !== 'true'
    }
  });

  if (argv.deleteIndex) {
    await deleteIndex(client);
  }

  if (argv.createIndex) {
    await createIndex(client);
  }

  console.error('Parsing records');
  const parser = fs.createReadStream(argv.file).pipe(parse({
    on_record: (record) => {
      const newRecord = {};
      for (const key of Object.keys(record)) {
        // Apply any necessary converters
        // XXX: A type mapping using an object will not
        //      pick up the corresponding converter. This
        //      is not an issue for now since this is only
        //      used for the text type, which has no conversion.
        const converter = CONVERTERS[TYPE_MAPPINGS[key]];
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

  // Start a progress bar
  const progressBar = new cliProgress.SingleBar({
    etaBuffer: 10000,
  }, cliProgress.Presets.shades_classic);
  progressBar.start(totalRows, 0);

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
    progressBar.update(i);

    // Add a batch of 100 records and update progress
    if (records.length >= 100 * 2) {
      await client.bulk({ operations: records });
      records = [];
    }
  }

  // Stop the progress bar
  progressBar.stop();

  // Perform one final bulk update if needed
  if (records.length > 0) {
    await client.bulk({ operations: records });
  }

  // Refresh the index
  console.error('Refreshing index');
  await client.indices.refresh({ index: process.env.REACT_APP_ES_INDEX });
}

run().catch(console.error);
