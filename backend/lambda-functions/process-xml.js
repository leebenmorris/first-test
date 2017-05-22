const s3EventHandler = event => {
  const s3event = event.Records && event.Records[0];
  return (s3event && s3event.eventSource === 'aws:s3' && s3event.s3)
    ? {
      srcBucket: s3event.s3.bucket.name,
      srcKey: s3event.s3.object.key
    }
    : false;
};

const handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const s3Result = s3EventHandler(event);
  console.log('s3 Event Result:\n', JSON.stringify(s3Result, null, 2));
  console.log('s3 Event Result Statement: ', s3Result && 's3 event handled');
};

module.exports = {
  handler,
  s3EventHandler
};