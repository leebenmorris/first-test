const fs = require('fs');

const s3Mock = require('mock-aws-s3');
s3Mock.config.basePath = 'spec/mock-s3-buckets';

const { expect } = require('chai');

const { s3Event } = require('./s3-sample-event');

const { handler } = require('../src/process-xml');

const testFileName = 'example-1.xml.txt';

const xmlTestFile = 'spec/mock-s3-buckets/first-xml/' + testFileName;

const xmlBucket = 'first-xml';

const {
  s3EventHandler,
  bufferToJson,
  findValueByKey,
  tidyItems,
  download
} = require('../helpers/helpers');

describe('handler', () => {
  it('is a function', () => {
    expect(handler).to.be.a('function');
  });
});

describe('s3EventHandler', () => {
  it('is a function', () => {
    expect(s3EventHandler).to.be.a('function');
  });

  it('returns an object with correct srcKey and srcBucket when given an s3 event', () => {
    const actual = s3EventHandler(s3Event);
    const expected = {
      srcBucket: xmlBucket,
      srcKey: testFileName
    };
    expect(actual).to.eql(expected);
  });

  it('returns false when NOT given an s3 event', () => {
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

describe('bufferToJson', () => {
  it('is a function', () => {
    expect(bufferToJson).to.be.a('function');
  });

  it('converts an xml file to JSON', () => {
    const buffer = fs.readFileSync(xmlTestFile);
    return bufferToJson(buffer)
      .then(json => {
        expect(json).to.be.a('object');
        expect(json.BACSDocument).to.be.a('object');
      });
  });

  // from: http://paulsalaets.com/testing-with-promises-in-mocha
  it('returns error if cannot convert buffer to JSON', () => {
    const buffer = Buffer.from('bananas');
    return bufferToJson(buffer)
      .then(() => {
        throw new Error('Promise was unexpectedly fulfilled');
      }, error => {
        expect(error).to.be.an.instanceof(Error);
      });
  });
});

describe('findValueByKey', () => {
  it('is a function', () => {
    expect(findValueByKey).to.be.a('function');
  });

  it('recursively searches for the given key, then returns it\'s value', () => {
    const buffer = fs.readFileSync(xmlTestFile);
    return bufferToJson(buffer)
      .then(json => {
        let value = findValueByKey(json, 'userNumber');
        expect(value).to.equal('123456');

        value = findValueByKey(json, 'ReturnedDebitItem');
        expect(value).to.be.a('array');
      });
  });

  it('returns false if key not found', () => {
    const buffer = fs.readFileSync(xmlTestFile);
    return bufferToJson(buffer)
      .then(json => {
        const value = findValueByKey(json, 'banana');
        expect(value).to.be.false;
      });
  });
});

describe('tidyItems', () => {
  it('is a function', () => {
    expect(tidyItems).to.be.a('function');
  });

  it('tidies up the ReturnedDebitItems array of objects', () => {
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

describe('download', () => {
  it('is a function', () => {
    expect(download).to.be.a('function');
  });

  it('correctly downloads a file from the given bucket', () => {
    return download(xmlBucket, testFileName, s3Mock.S3())
      .then(res => {
        const buffer = res.Body;
        expect(res).to.be.a('object');
        expect(res.Key).to.equal(testFileName);
        expect(Buffer.isBuffer(buffer)).to.be.true;
        return bufferToJson(buffer)
          .then(json => {
            let value = findValueByKey(json, 'userNumber');
            expect(value).to.equal('123456');

            value = findValueByKey(json, 'ReturnedDebitItem');
            expect(value).to.be.a('array');
          });
      });
  });
});