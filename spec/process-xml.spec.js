const fs = require('fs');

const s3Mock = require('mock-aws-s3');
const s3 = s3Mock.S3();
s3Mock.config.basePath = 'spec/mock-s3-buckets';

const { expect } = require('chai');

const { s3Event } = require('./s3-sample-event');

const { handler } = require('../src/process-xml');

const testFileName = 'example-1.xml.txt';

const xmlTestFile = 'spec/mock-s3-buckets/first-xml/' + testFileName;

const xmlBucket = 'first-xml';

const archiveBucket = xmlBucket + '-archived';

const archiveFileName = 'archived.' + testFileName;

const {
  s3EventHandler,
  bufferToJson,
  findValueByKey,
  tidyItems,
  download,
  copy,
  remove,
  list,
  fullJsonToDb,
  returnedDebitItemsToDb
} = require('../helpers/helpers');

describe('handler', function () {
  it('is a function', function () {
    expect(typeof handler).to.equal('function');
  });
});

describe('s3EventHandler', function () {
  it('is a function', function () {
    expect(s3EventHandler).to.be.a('function');
  });

  it('returns an object with correct srcKey and srcBucket when given an s3 event', function () {
    const actual = s3EventHandler(s3Event);
    const expected = {
      srcBucket: xmlBucket,
      srcKey: testFileName
    };
    expect(actual).to.eql(expected);
  });

  it('returns false when NOT given an s3 event', function () {
    s3Event.Records[0].eventSource = 'x';

    let actual = s3EventHandler(s3Event);
    expect(actual).to.be.false;

    actual = s3EventHandler({});
    expect(actual).to.be.false;

    actual = s3EventHandler(1);
    expect(actual).to.be.false;

    actual = s3EventHandler('a');
    expect(actual).to.be.false;
  });
});

describe('bufferToJson', function () {
  it('is a function', function () {
    expect(bufferToJson).to.be.a('function');
  });

  it('converts an xml file to JSON', function () {
    const buffer = fs.readFileSync(xmlTestFile);
    return bufferToJson(buffer)
      .then(json => {
        expect(json).to.be.a('object');
        expect(json.BACSDocument).to.be.a('object');
      });
  });

  // from: http://paulsalaets.com/testing-with-promises-in-mocha
  it('returns error if cannot convert buffer to JSON', function () {
    const buffer = Buffer.from('bananas');
    return bufferToJson(buffer)
      .then(function () {
        throw new Error('Promise was unexpectedly fulfilled');
      }, error => {
        expect(error).to.be.an.instanceof(Error);
      });
  });
});

describe('findValueByKey', function () {
  it('is a function', function () {
    expect(findValueByKey).to.be.a('function');
  });

  it('recursively searches for the given key, then returns it\'s value', function () {
    const buffer = fs.readFileSync(xmlTestFile);
    return bufferToJson(buffer)
      .then(json => {
        let value = findValueByKey(json, 'userNumber');
        expect(value).to.equal('123456');

        value = findValueByKey(json, 'ReturnedDebitItem');
        expect(value).to.be.a('array');
      });
  });

  it('returns false if key not found', function () {
    const buffer = fs.readFileSync(xmlTestFile);
    return bufferToJson(buffer)
      .then(json => {
        const value = findValueByKey(json, 'banana');
        expect(value).to.be.false;
      });
  });
});

describe('tidyItems', function () {
  it('is a function', function () {
    expect(tidyItems).to.be.a('function');
  });

  it('tidies up the ReturnedDebitItems array of objects', function () {
    const buffer = fs.readFileSync(xmlTestFile);
    const firstTidiedItem = {
      fromFile: testFileName,
      ref: 'X01234-1',
      transCode: '17',
      returnCode: '1012',
      returnDescription: 'INSTRUCTION CANCELLED',
      originalProcessingDate: '2017-01-12',
      valueOf: '65.00',
      currency: 'GBP',
      PayerAccount: {
        number: '12345678',
        ref: 'X01234',
        name: 'FRED SMITH',
        sortCode: '01-02-03',
        bankName: 'A BANK',
        branchName: 'A BRANCH'
      }
    };
    return bufferToJson(buffer)
      .then(json => {
        const items = findValueByKey(json, 'ReturnedDebitItem');
        const tidiedItems = tidyItems(items, testFileName);
        expect(tidiedItems).to.be.a('array');
        expect(tidiedItems[0]).to.be.a('object');
        expect(tidiedItems.length).to.be.equal(3);
        expect(tidiedItems[0]).to.eql(firstTidiedItem);
      });
  });
});

describe('download', function () {
  it('is a function', function () {
    expect(download).to.be.a('function');
  });

  it('correctly downloads a file from the given bucket', async function () {
    const data = await download(xmlBucket, testFileName, s3);
    const buffer = data.Body;

    expect(data).to.be.a('object');
    expect(data.Key).to.equal(testFileName);
    expect(Buffer.isBuffer(buffer)).to.be.true;

    const json = await bufferToJson(buffer);

    let value = findValueByKey(json, 'userNumber');
    expect(value).to.equal('123456');

    value = findValueByKey(json, 'ReturnedDebitItem');
    expect(value).to.be.a('array');
  });
});

describe('copy', function () {
  it('is a function', function () {
    expect(copy).to.be.a('function');
  });

  it('copies a file from one s3 bucket to another', async function () {
    await copy(xmlBucket, testFileName, archiveBucket, archiveFileName, s3);

    const data = await download(archiveBucket, archiveFileName, s3);
    const buffer = data.Body;
    expect(data).to.be.a('object');
    expect(data.Key).to.equal(archiveFileName);
    expect(Buffer.isBuffer(buffer)).to.be.true;
  });
});

describe('remove', function () {
  it('is a function', function () {
    expect(remove).to.be.a('function');
  });

  it('removes a file from an s3 bucket', async function () {
    const preList = (await list(archiveBucket, s3)).Contents;

    await remove(archiveBucket, archiveFileName, s3);

    const postList = (await list(archiveBucket, s3)).Contents;

    expect(Array.isArray(preList)).to.be.true;
    expect(preList.length).to.equal(1);

    expect(preList[0].Key).to.equal(archiveFileName);
    expect(postList.length).to.equal(0);
  });
});

describe('fullJsonToDb', function () {
  it('is a function', function () {
    expect(fullJsonToDb).to.be.a('function');
  });

  it('adds a full JSON record to the database and returns it\'s ID', async function () {
    const buffer = fs.readFileSync(xmlTestFile);
    const json = await bufferToJson(buffer);

    const id = await fullJsonToDb(testFileName, json);
    expect(id).to.be.a('number');
  });
});

describe('returnedDebitItemsToDb', function () {
  it('is a function', function () {
    expect(returnedDebitItemsToDb).to.be.a('function');
  });

  it('adds each individual debit item to the database', async function () {
    const buffer = fs.readFileSync(xmlTestFile);
    const json = await bufferToJson(buffer);
    const id = await fullJsonToDb(testFileName, json);

    const items = findValueByKey(json, 'ReturnedDebitItem');
    const tidiedItems = tidyItems(items, testFileName);

    for (let item of tidiedItems)
      await returnedDebitItemsToDb(item.ref, item, id);
    expect(id).to.be.a('number');
  });
});