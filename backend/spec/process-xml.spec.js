const fs = require('fs');

const { expect } = require('chai');

const { s3Event } = require('./s3-sample-event');

const {
  handler,
  s3EventHandler,
  bufferToJson } = require('../lambda-functions/process-xml');

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