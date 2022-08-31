require('dotenv').config();

const fs = require('fs');

const cliProgress = require('cli-progress');
const { Client } = require('@elastic/elasticsearch')

function unclusteredQuery() {
  return {
    index: process.env.REACT_APP_ES_INDEX,
    query: {
      bool: {
        must_not: {
          // Only include documents which have not been clustered
          exists: {field: '_FLNG_ENT_CLUSTER_ID'}
        }
      }
    }
  };
}

async function getUnclustered(client) {
  return client.search({
    from: 0,
    size: 1000,
    ...unclusteredQuery()
  });
}

async function countUnclustered(client) {
  return client.count(unclusteredQuery());
}

function spanMatchClause(field, word) {
  if (isNaN(word)) {
    return {
      span_multi: {
        match: {
          fuzzy: {
            [field]: {
              value: word,
              fuzziness: 'AUTO',
            }
          }
        },
      }
    }
  } else {
    return {
      span_term: {
        [field]: word
      }
    }
  }
}

function spanMatch(field, phrase) {
  const words = (phrase || '').trim().split(/\s+/);
  const clauses = words
    .filter(word => word.length > 2)
    .map(word => spanMatchClause(field, word));

  const matches = words
    .filter(word => word.length <= 2)
    .map(word => ({match: {[field]: word}}));

  if (clauses.length > 0) {
    matches.push({
      span_near: {
        clauses: clauses,
        slop: 0,
        in_order: true
      }
    });
  }

  return matches;
}

async function getMatches(client, item) {
  return client.search({
    index: process.env.REACT_APP_ES_INDEX,
    from: 0,
    size: 10000,
    query: {
      bool: {
        must_not: {
          exists: {field: '_FLNG_ENT_CLUSTER_ID'},
        },
        must: [
          spanMatch('FLNG_ENT_FIRST_NAME', item['FLNG_ENT_FIRST_NAME']),
          spanMatch('FLNG_ENT_LAST_NAME', item['FLNG_ENT_LAST_NAME']),
          spanMatch('FLNG_ENT_ADD1', item['FLNG_ENT_ADD1']),
          spanMatch('FLNG_ENT_CITY', item['FLNG_ENT_CITY']),
          {
            prefix: {
              // Since we might have zip+4, check if the first part matches
              FLNG_ENT_ZIP: (item['FLNG_ENT_ZIP'] || '').split('-')[0],
            }
          },
        ].flat(),

        // This currently doesn't do anything but
        // boost the score if the middle name matches
        should: {
          match: {
            FLNG_ENT_MIDDLE_NAME: {
              query: item['FLNG_ENT_MIDDLE_NAME'] || '',
              fuzziness: 'AUTO'
            }
          }
        }
      }
    }
  });
}

async function run () {
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

  // Add a new keyword mapping for the cluster ID
  await client.indices.putMapping({
    index: process.env.REACT_APP_ES_INDEX,
    properties: {
      _FLNG_ENT_CLUSTER_ID: {type: 'keyword'}
    }
  });

  // Start a progress bar
  const totalUnclustered = (await countUnclustered(client)).count;
  const progressBar = new cliProgress.SingleBar({
    etaBuffer: 10000,
  }, cliProgress.Presets.shades_classic);
  progressBar.start(totalUnclustered, 0);

  // Get values which have not been clustered
  let unclustered = await getUnclustered(client);
  while (unclustered.hits.hits.length > 0) {
    const skip = new Set();
    for (const doc of unclustered.hits.hits) {
      // We already assigned a cluster in this batch, skip
      if (skip.has(doc._id)) {
        continue;
      }

      const matches = await getMatches(client, doc._source);

      // Assign everything in this cluster the ID of the first document
      const updates = [];
      for (const match of [doc, ...matches.hits.hits]) {
        // Track documents to skip
        skip.add(match._id);

        updates.push({
          update: {_id: match._id, _index: process.env.REACT_APP_ES_INDEX}
        });
        updates.push({
          doc: {_FLNG_ENT_CLUSTER_ID: doc._id}
        })
      }
      await client.bulk({ operations: updates });
    }

    // Refresh the index
    await client.indices.refresh({ index: process.env.REACT_APP_ES_INDEX });

    // Get the next batch of unclustered values
    unclustered = await getUnclustered(client);

    // Count remaining unclustered documents
    progressBar.update(totalUnclustered - (await countUnclustered(client)).count);
  }
}

run().catch(console.log)
