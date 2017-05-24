const h = require('../helpers/helpers');

const keytoFind = 'ReturnedDebitItem';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const { srcBucket, srcKey } = h.s3EventHandler(event);
    const dstBucket = srcBucket + '-archived';
    const dstKey = 'archived.' + srcKey;

    console.log('names:\n', srcBucket, srcKey, dstBucket, dstKey);

    const srcBuffer = (await h.download(srcBucket, srcKey)).Body;

    const json = await h.bufferToJson(srcBuffer);

    const returnedItems = h.findValueByKey(json, keytoFind);
    if (!returnedItems) throw new Error(`Key '${keytoFind}' not found in JSON converted from '${srcKey}'`);

    const tidyItems = h.tidyItems(returnedItems, srcKey);

    console.log('\n', JSON.stringify(tidyItems, null, 2));
  }
  catch (err) { console.log(err); }
};