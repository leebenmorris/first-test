const h = require('../helpers/helpers');

const responseObj = (result, statusCode) => ({
  statusCode: statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS 
    "Content-Type": "application/json"
  },
  body: JSON.stringify(result)
});

exports.handler = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const items = await h.getReturnedDebitItemsFromDb();
    cb(null, responseObj(items, 200));
  }
  catch (err) { cb(new Error(err)); }
};