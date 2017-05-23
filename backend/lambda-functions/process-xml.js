/* globals Promise:true */
Promise = require('bluebird');

const { parseString } = require('xml2js');

const bufferToJson = Promise.promisify(parseString);

// from: https://claudiajs.com/tutorials/designing-testable-lambdas.html
const s3EventHandler = event => {
  const s3event = event.Records && event.Records[0];
  return (s3event && s3event.eventSource === 'aws:s3' && s3event.s3)
    ? {
      srcBucket: s3event.s3.bucket.name,
      srcKey: s3event.s3.object.key
    }
    : false;
};

// recusrsively searches object and returns value if truthy at given key
const findValueByKey = (obj, keyToFind) => {
  if (obj[keyToFind]) return obj[keyToFind];

  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      const result = findValueByKey(obj[key], keyToFind);
      if (result) return result;
    }
  }
  return false;
};

const handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const s3Result = s3EventHandler(event);
  console.log('s3 Event Result:\n', JSON.stringify(s3Result, null, 2));
  console.log('s3 Event Result Statement: ', s3Result && 's3 event handled');
};

module.exports = {
  handler,
  s3EventHandler,
  bufferToJson,
  findValueByKey
};