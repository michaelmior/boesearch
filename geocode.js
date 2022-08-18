const fs = require('fs');
const readline = require('readline');

const fetch = require('node-fetch');

require('dotenv').config();

const addressFile = process.argv[2];
const geocodedFile = process.argv[3];

const url = `https://api.geoapify.com/v1/batch?apiKey=${process.env.GEOAPIFY_KEY}`;

function getBodyAndStatus(response) {
  return response.json().then(responseBody => {
    return {
      status: response.status,
      body: responseBody
    }
  });
}

function getAsyncResult(url, timeout, maxAttempt) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      repeatUntilSuccess(resolve, reject, 0)
    }, timeout);
  });

  function repeatUntilSuccess(resolve, reject, attempt) {
    console.log('Attempt: ' + attempt);
    fetch(url)
      .then(getBodyAndStatus)
      .then(result => {
        if (result.status === 200) {
          resolve(result.body);
        } else if (attempt >= maxAttempt) {
          reject('Max amount of attempt achived');
        } else if (result.status === 202) {
          // Check again after timeout
          setTimeout(() => {
            repeatUntilSuccess(resolve, reject, attempt + 1)
          }, timeout);
        } else {
          // Something went wrong
          reject(result.body)
        }
      })
      .catch(err => reject(err));
  };
}

async function getBatch(addreses) {
  const data = {
    'api': '/v1/geocode/search',
    'params': { },
    'inputs': addreses.map(a => ({params: {text: a}}))
  };

  const result = await fetch(url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(getBodyAndStatus)
    .then((result) => {
      if (result.status !== 202) {
        return Promise.reject(result)
      } else {
        return getAsyncResult(`${url}&id=${result.body.id}`, 300000, 100).then(queryResult => {
          return queryResult;
        });
      }
    })
    .catch(err => console.log(err));

  for (const r of result.results) {
    await fs.promises.appendFile(geocodedFile, JSON.stringify(r) + '\n');
  }
}

async function run() {
  const addresses = [];

  const readInterface = readline.createInterface({
    input: fs.createReadStream(addressFile)
  });

  for await (const line of readInterface){
    addresses.push(line);

    if (addresses.length === 100) {
      await getBatch(addresses);
      break;
    }
  }
};

run().catch(console.log)
