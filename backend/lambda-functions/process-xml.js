async function processXml(event) {
  try {
    console.log('Reading event:\n', JSON.stringify(event, null, 2));
    return 'Process completed successfully';
  }
  catch (err) { return err; }
}

exports.handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  processXml(event)
    .then(res => console.log(res))
    .catch(err => console.log(err));
};