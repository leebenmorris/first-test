const h = require('../helpers/helpers');

const keytoFind = 'ReturnedDebitItem';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const { srcBucket, srcKey } = h.s3EventHandler(event);
    const dstBucket = srcBucket + '-archived';
    const dstKey = 'archived.' + srcKey;

    const srcBuffer = (await h.download(srcBucket, srcKey)).Body;

    const json = await h.bufferToJson(srcBuffer);

    const returnedItems = h.findValueByKey(json, keytoFind);
    if (!returnedItems) throw new Error(`Key '${keytoFind}' not found in JSON converted from '${srcKey}'`);

    const tidiedItems = h.tidyItems(returnedItems, srcKey);

    const jsonId = await h.fullJsonToDb(srcKey, json);

    for (let item of tidiedItems)
      await h.returnedDebitItemsToDb(item.ref, item, jsonId);

    await h.copy(srcBucket, srcKey, dstBucket, dstKey);

    await h.remove(srcBucket, srcKey);
  }
  catch (err) { console.log(err); }
};