var got = require("got");
var nonodeify = require("nonodeify");

var ADDRESS_REGEXP = require("./lib/address-regexp");

function checkPoweredBy(res) {
  if(res.headers["x-powered-by"] !== "manage-hosts") {
    var err = new Error("Response not from manage-hosts app missing 'x-powered-by' header");
  }
  return res;
}

module.exports = function(address) {
  address = address || "127.0.0.1:80";
  var matches = address.match(ADDRESS_REGEXP);

  if(!matches) {
    throw "Invalid address";
  }

  function handleError(err) {
    if(err && err.code && err.code === "ECONNREFUSED") {
      err = new Error();
      err.message = "Expecting manage-hosts to be started on '"+address+"', find out about that <https://github.com/orangemug/manage-hosts>";
    }
    return err;
  }

  var host = matches[1];
  var port = matches[2];

  if(port === undefined) {
    port = 80;
  }

  return {
    add: function(data, done) {
      done = nonodeify(done);

      // So we can query if it's started globally
      return got.post("http://"+address, {body: JSON.stringify(data)})
        .catch(function(err) {
          throw handleError(err)
        })
        .then(checkPoweredBy)
        .then(done.then)
        .catch(done.catch);
    },
    remove: function(data, done) {
      done = nonodeify(done);

      if(!Array.isArray(data)) {
        data = Object.keys(data);
      }

      // So we can query if it's started globally
      return got.delete("http://"+address, {body: JSON.stringify(data)})
        .catch(function(err) {
          throw handleError(err)
        })
        .then(checkPoweredBy)
        .then(done.then)
        .catch(done.catch);
    },
    proxyUrl: function(base) {
      return "http://"+address+"/goto"+base;
    }
  };
}
