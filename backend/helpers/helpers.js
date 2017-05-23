/* globals Promise:true */
Promise = require('bluebird');

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

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

// recursively searches object and returns value if truthy at given key
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

const tidyItems = (items, fileName) =>
  items.map(item => {
    item.$.fromFile = fileName;
    item.$.PayerAccount = item.PayerAccount[0].$;
    return item.$;
  });

const download = (srcBucket, srcKey, method = s3) =>
  new Promise((resolve, reject) =>
    method.getObject(
      {
        Bucket: srcBucket,
        Key: srcKey
      },
      (err, res) => err ? reject(err) : resolve(res)
    )
  );

const copy = (srcBucket, srcKey, dstBucket, dstKey, method = s3) =>
  new Promise((resolve, reject) =>
    method.copyObject(
      {
        Bucket: dstBucket,
        Key: dstKey,
        CopySource: srcBucket + '/' + srcKey
      },
      (err, res) => err ? reject(err) : resolve(res)
    )
  );

module.exports = {
  s3EventHandler,
  bufferToJson,
  findValueByKey,
  tidyItems,
  download,
  copy
};