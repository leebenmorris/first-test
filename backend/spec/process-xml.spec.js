const fs = require('fs');

const { expect } = require('chai');

const { s3Event } = require('./s3-sample-event');

const {
  handler,
  s3EventHandler,
  bufferToJson,
  findValueByKey } = require('../src/process-xml');

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
      srcBucket: 'first-xml',
      srcKey: 'example-1.xml.txt'
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
    const buffer = fs.readFileSync('spec/example-1.xml.txt');
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
      .then(json => {
        throw new Error('Promise was unexpectedly fulfilled with:\n' + JSON.stringify(json, null, 2));
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
    const buffer = fs.readFileSync('spec/example-1.xml.txt');
    bufferToJson(buffer)
      .then(json => {
        let value = findValueByKey(json, 'userNumber');
        expect(value).to.equal('123456');

        value = findValueByKey(json, 'ReturnedDebitItem');
        expect(value).to.be.a('array');
      });
  });

  it('returns false if key not found', () => {
    const buffer = fs.readFileSync('spec/example-1.xml.txt');
    bufferToJson(buffer)
      .then(json => {
        const value = findValueByKey(json, 'banana');
        expect(value).to.be.false;
      });
  });
});