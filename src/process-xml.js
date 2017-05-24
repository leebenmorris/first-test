const h = require('../helpers/helpers');

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    console.log('Reading event:\n', JSON.stringify(event, null ,2));
    const { srcBucket, srcKey } = h.s3EventHandler(event);
    const dstBucket = srcBucket + '-archived';
    const dstKey = 'archived.' + srcKey;

    console.log('names:\n', srcBucket, srcKey, dstBucket, dstKey);

    const srcBuffer = (await h.download(srcBucket, srcKey, s3)).Body;

    console.log(srcBuffer);
  }
  catch (err) { console.log(err); }
};