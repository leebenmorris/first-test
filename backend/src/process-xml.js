const { s3EventHandler } = require('../helpers/helpers');

exports.handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const s3Result = s3EventHandler(event);
  console.log('s3 Event Result:\n', JSON.stringify(s3Result, null, 2));
  console.log('s3 Event Result Statement: ', s3Result && 's3 event handled');
};