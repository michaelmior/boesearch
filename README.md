# New York State Board of Elections data search
[![CI](https://github.com/michaelmior/boesearch/actions/workflows/ci.yml/badge.svg)](https://github.com/michaelmior/boesearch/actions/workflows/ci.yml)

## Setting environment variables

Several environment variables need to be set to work with the project.
Start by copying [`.env.sample`](.env.sample) to `.env`.
This file should **not** be committed to the repository as it will contain private information.
For development purposes, pick a (secure) random password for each of the three Elasticsearch users mentioned in the file.
Read below for setup with a separate Elasticsearch instance.
You will also need a valid Google Maps API key.

## Elasticsearch setup

For development, you should use [Docker Compose](https://docs.docker.com/compose/) as this is the easiest way to get started.
Run `docker compose up` and all the necessary containers for Elasticsearch should start.
(Note that the frontend does *not* run as a Docker container).

If you are using a separate Elasticsearch instance (for example, for a production deployment), you will need to set `ELASTIC_PASSWORD` in the `.env` file to the password of the `elastic` user.
Furthermore, you will need to create a read-only user that the frontend can use and set `REACT_APP_ES_USER` and `REACT_APP_ES_PASSWORD` appropriately.

## Gathering data

The data can be obtained from the [Campaign Finance Bulk Download](https://publicreporting.elections.ny.gov/DownloadCampaignFinanceData/DownloadCampaignFinanceData) by selecting "Filer Data" (or by [directly using the download endpoint](https://publicreporting.elections.ny.gov/DownloadCampaignFinanceData/DownloadZipFile?lstDateType=--lstDateType&lstUCYearDCF=--lstUCYearDCF&lstFilingDesc=--lstFilingDesc)).
After downloading and unzipping, the result will be five separate data files:

- `COMMCAND.CSV`  - all candidate data
- `STATE_CANDIDATE.csv` - filings for state candidates
- `STATE_COMMITTEE.csv` - filings for state committees
- `COUNTY_CANDIDATE.csv` - filings for county candidates
- `COUNTY_COMMITTEE.csv` - filings for county committees

Unfortunately, these CSV files do not have header information.
The header data can be extracted from the PDF files provided along with each CSV.
Current headers are listed in [`candidate-headers.txt.txt`](candidate-headers.txt) and [`filer-headers.txt`](filer-headers.txt).
Before importing the data, these headers must be added to the beginning of each file and all the filer data must be concatenated together and joined with the candidate data.

To add the headers, concatenate the data files:

```
cat candidate-headers.txt COMMCAND.CSV > COMMCAND-headers.csv
cat filer-headers.txt STATE_CANDIDATE.csv STATE_COMMITTEE.csv COUNTY_CANDIDATE.csv COUNTY_COMMITTEE.csv > ALL-headers.csv
```

Finally, we need join the candidate data with the filing information.
The easiest way to do so is using [xsv](https://github.com/BurntSushi/xsv).

```
xsv join FILER_ID ALL-headers.csv FILER_ID COMMCAND-headers.CSV > ALL-joined.csv
```

This joined data file can then be imported into Elasticsearch by first installing the node.js dependencies, and then running the included import script.

```
yarn install
node import.js --create-index ALL-joined.csv
```

## React Setup

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `yarn run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
The app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
