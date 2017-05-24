const responseObj = (result, statusCode) => ({
  statusCode: statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS 
    "Content-Type": "application/json"
  },
  body: JSON.stringify(result)
});

exports.handler = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const res = { success: 'End Point Reached' };
    cb(null, responseObj(res, 200));
  }
  catch (err) { cb(new Error(err)); }
};