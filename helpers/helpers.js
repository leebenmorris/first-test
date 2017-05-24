const Promise = require('bluebird');

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const { parseString } = require('xml2js');

const bufferToJson = Promise.promisify(parseString);

const pgp = require('pg-promise')({ promiseLib: Promise });

const dbCredentials = require('../db-config/db-config').local;
const db = pgp(dbCredentials);

const fullJsonToDb = (srcKey, json) =>
  db.one(
    'INSERT INTO full_json (orig_doc_name, doc_json) VALUES ($1, $2) RETURNING id',
    [srcKey, json]
  )
    .then(res => res.id);

const returnedDebitItemsToDb = (itemRef, item, jsonId) =>
  db.none(`
    INSERT INTO returned_debit_items (ref, item_json, doc_id)
    VALUES ($1, $2, $3)`,
    [itemRef, item, jsonId]
  )
    .then(() => pgp.end());

const emptydBTables = () =>
  db.none(`TRUNCATE returned_debit_items`)
    .then(() => db.none(`TRUNCATE full_json CASCADE`))
    .then(() => pgp.end());

const initdbTables = () =>
  db.none(`DROP TABLE IF EXISTS returned_debit_items`)
    .then(() => db.none(`DROP TABLE IF EXISTS full_json`))
    .then(() => db.none(`
      CREATE TABLE full_json (
      id SERIAL PRIMARY KEY,
      orig_doc_name TEXT,
      doc_json JSONB,
      post_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`))
    .then(() => db.none(`
      CREATE TABLE returned_debit_items (
      id SERIAL PRIMARY KEY,
      ref TEXT,
      item_json JSONB,
      doc_id INT,
      post_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doc_id) REFERENCES full_json(id)
    )`))
    .then(() => pgp.end());

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

const remove = (srcBucket, srcKey, method = s3) =>
  new Promise((resolve, reject) =>
    method.deleteObject(
      {
        Bucket: srcBucket,
        Key: srcKey
      },
      (err, res) => err ? reject(err) : resolve(res)
    )
  );

const list = (srcBucket, method = s3) =>
  new Promise((resolve, reject) =>
    method.listObjects(
      {
        Bucket: srcBucket
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
  copy,
  remove,
  list,
  fullJsonToDb,
  returnedDebitItemsToDb,
  emptydBTables,
  initdbTables
};