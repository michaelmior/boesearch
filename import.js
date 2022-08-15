'use strict'

const fs = require('fs');

const { parse } = require('csv-parse');
const { Client } = require('@elastic/elasticsearch')

const types = {
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
  FLNG_ENT_ADD1: 'text',
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

async function run () {
  // Build the type mapping for ES
  const typeMapping = {};
  for (const [key, type] of Object.entries(types)) {
    typeMapping[key] = {type: type};
  }

  // Build the ES client object
  const client = new Client({
    node: 'https://localhost:9200',
    auth: {
      username: 'elastic',
      password: 'yEvy9GU2KRcD^x*q'
    },
    tls: {
      ca: fs.readFileSync('./ca.crt'),
      rejectUnauthorized: false
    }
  })


  // Create a new index with the appropriate mapping
  await client.indices.create({
    index: 'boesearch',
    mappings: {
      properties: typeMapping
    }
  });

  const parser = fs.createReadStream('./COUNTY_COMMITTEE.csv').pipe(parse({
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
    skip_records_with_error: true,
    columns: true
  }));

  let i = 0;
  let records = [];
  for await (const record of parser) {
    // Add the necessary elements for bulk update
    records.push({index: {_index: 'boesearch'}})
    records.push(record);
    i += 1;

    // Add a batch of 100 records and update progress
    if (records.length >= 100) {
      await client.bulk({ operations: records });
      records = [];
      console.log(i);
    }
  }

  // Perform one final bulk update if needed
  if (records.length > 0) {
    await client.bulk({ operations: records });
  }

  // Refresh the index
  await client.indices.refresh({ index: 'boesearch' });
}

run().catch(console.log)
