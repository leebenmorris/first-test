const { expect } = require('chai');

const { handler } = require('../lambda-functions/process-xml');

describe('handler', () => {
  it('is a function', () => {
    expect(handler).to.be.a('function');
  });
});