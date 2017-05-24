const h = require('../helpers/helpers');

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const { srcBucket, srcKey } = h.s3EventHandler(event);
    const dstBucket = srcBucket + '-archived';
    const dstKey = 'archived.' + srcKey;

    console.log('names:\n', srcBucket, srcKey, dstBucket, dstKey);

    const srcBuffer = (await h.download(srcBucket, srcKey)).Body;

    const json = await h.bufferToJson(srcBuffer);

    console.log('\n', JSON.stringify(json, null, 2));
  }
  catch (err) { console.log(err); }
};