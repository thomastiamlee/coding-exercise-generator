const Request = require("request");

/* This function sends a request to the given URL. This function is asynchronous. */
function sendRequest(url) {
  return new Promise(function(resolve, reject) {
    Request(url, function(error, response, body) {
      if (!error) {
        resolve(JSON.parse(body));
      }
      else {
        reject("Bad request");
      }
    });
  });
}

async function sendExampleRequest() {
  return new Promise(function(resolve, reject) {
    var result = await sendRequest("http://api.conceptnet.io/c/en/example");
    resolve(result);
  });
}

module.exports = {sendRequest, sendExampleRequest};
