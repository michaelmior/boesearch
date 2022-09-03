const faker = require('@faker-js/faker').faker;

function getRandomContribution() {
  const date = faker.date.past(10);
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const state = faker.datatype.boolean() ? 'NY': faker.address.stateAbbr();
  const contribution = {
    'FILER_ID': faker.datatype.number(),
    'FILER_PREVIOUS_ID': '',
    'CAND_COMM_NAME': faker.name.fullName(),
    'ELECTION_YEAR': date.getFullYear(),
    'ELECTION_TYPE': 'State/Local', // Also 'Village', 'County'
    'COUNTY_DESC': faker.address.county(),
    'FILING_ABBREV': 'A', // A-L
    'FILING_DESC': '32-Day Pre-Primary', // Other values possible, corresponding with above
    'R_AMEND': faker.datatype.boolean() ? 'Y' : 'N',
    'FILING_CAT_DESC': 'Itemized',
    'FILING_SCHED_ABBREV': 'D', // Other possible values
    'FILING_SCHED_DESC': 'In-Kind (Non-Monetary) Contributions Received', // Other values possible, corresponding with above
    'LOAN_LIB_NUMBER': '',
    'TRANS_MAPPING': faker.datatype.uuid(),
    'TRANS_NUMBER': '',
    'SCHED_DATE': `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} 00:00:00`,
    'CNTRBN_TYPE_DESC': '',
    'TRANSFER_TYPE_DESC': '',
    'RECEIPT_TYPE_DESC': '',
    'RECEIPT_CODE_DESC': '',
    'R_SUBCONTRACTOR': '',
    'FLNG_ENT_NAME': faker.datatype.boolean() ? faker.company.name() : faker.name.fullName({firstName, lastName}),
    'FLNG_ENT_FIRST_NAME': firstName,
    'FLNG_ENT_MIDDLE_NAME': faker.datatype.boolean() ? faker.name.middleName() : '',
    'FLNG_ENT_LAST_NAME': lastName,
    'FLNG_ENT_ADD1': faker.address.streetAddress(),
    'FLNG_ENT_CITY': faker.address.city(),
    'FLNG_ENT_STATE': state,
    'FLNG_ENT_ZIP': faker.address.zipCodeByState(state),
    'FLNG_ENT_COUNTRY': 'United States', // XXX Not all donations are from the US
    'PAYMENT_TYPE_DESC': '',
    'PAY_NUMBER': '',
    'OWED_AMT': '',
    'ORG_AMT': faker.datatype.float({max: 10000}),
    'LOAN_OTHER_DESC': '',
    'TRANS_EXPLNTN': '',
    'R_ITEMIZED': 'Y',
    'R_LIABILITY': '',
    'ELECTION_YEAR_R': '',
    'OFFICE_DESC': '',
    'DISTRICT': '',
    'DIST_OFF_CAND_BAL_PROP': '',
    'FILER_NAME': faker.name.fullName(),
    'COMPLIANCE_TYPE_DESC': faker.datatype.boolean() ? 'CANDIDATE' : 'COMMITTEE',
    'FILER_TYPE_DESC': faker.datatype.boolean() ? 'County' : 'State',
    'STATUS': faker.datatype.boolean() ? 'ACTIVE' : 'TERMINATED',
    'COMMITTEE_TYPE_DESC': '',
    'MUNICIPALITY_DESC': '',
    'TREASURER_FIRST_NAME': '',
    'TREASURER_MIDDLE_NAME': '',
    'TREASURER_LAST_NAME': '',
    'ADDRESS': faker.address.streetAddress(),
    'CITY': faker.address.city(),
    'STATE': 'NY',
    'ZIPCODE': faker.address.zipCodeByState('NY'),
  }

  return contribution;
}

for (let i = 0; i < 1000; i++) {
  const contribution = getRandomContribution();
  // Print the header the first time
  if (i === 0) {
    console.log(Object.keys(contribution).join(','));
  }

  // Print the row
  // XXX This depends on Object.keys and Object.values producing things in a
  //     consistent order. This is generally a bad idea, but it works.
  console.log(Object.values(contribution).map(s => '"' + s + '"').join(','));
}
