exports.handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('Reading event:\n', JSON.stringify(event, null, 2));
};