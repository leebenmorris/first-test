const s3EventHandler = event => {
  console.log('Reading event:\n', JSON.stringify(event, null, 2));
};

const handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  s3EventHandler(event);
};

module.exports = {
  handler,
  s3EventHandler
};