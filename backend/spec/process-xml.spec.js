const { expect } = require('chai');

const { handler, s3EventHandler } = require('../lambda-functions/process-xml');

const { s3Event } = require('./s3-sample-event');

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