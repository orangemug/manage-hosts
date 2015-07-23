var got = require("got");

var ADDRESS_REGEXP = require("./lib/address-regexp");

module.exports = function(address) {
  address = address || "127.0.0.1:80";
  var matches = address.match(ADDRESS_REGEXP);

  if(!matches) {
    throw "Invalid address";
  }

  var host = matches[1];
  var port = matches[2];

  if(port === undefined) {
    port = 80;
  }

  return {
    started: function(done) {
      // So we can query if it's started globally
      got("http://"+address, function(err) {
        done(!!err);
      });
    },
    add: function(data, done) {
      var data = 
      // So we can query if it's started globally
      got.post("http://"+address, {body: JSON.stringify(data)}, function(err) {
        done(!!err);
      });
    },
    remove: function(data, done) {
      if(!Array.isArray(data)) {
        data = Object.keys(data);
      }

      // So we can query if it's started globally
      got.delete("http://"+address, {body: JSON.stringify(data)}, function(err) {
        done(!!err);
      });
    },
    proxyUrl: function(base) {
      return "http://"+address+"/goto"+base;
    }
  };
}
