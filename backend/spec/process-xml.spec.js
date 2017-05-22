const { expect } = require('chai');

const { handler, s3EventHandler } = require('../lambda-functions/process-xml');

describe('handler', () => {
  it('is a function', () => {
    expect(handler).to.be.a('function');
  });
});

describe('s3EventHandler', () => {
  it('is a function', () => {
    expect(s3EventHandler).to.be.a('function');
  });
});