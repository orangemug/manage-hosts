var got = require("got");

var ADDRESS_REGEXP = require("./lib/address-regexp");

module.exports = function(address) {
  address = address || "127.0.0.1:80";
  var matches = address.match(ADDRESS_REGEXP);

  var host = matches[0];
  var port = matches[1];

  if(port === undefined) {
    port = 80;
  }

  return {
    started: function(done) {
      // So we can query if it's started globally
      got("http://"+host, function(err) {
        done(!!err);
      });
    },
    add: function(data, done) {
      var data = 
      // So we can query if it's started globally
      got.post("http://"+host, {body: JSON.stringify(data)}, function(err) {
        console.log(err);
        done(!!err);
      });
    },
    remove: function(data, done) {
      if(!Array.isArray(data)) {
        data = Object.keys(data);
      }

      // So we can query if it's started globally
      got.delete("http://"+host, {body: JSON.stringify(data)}, function(err) {
        done(!!err);
      });
    }
  };
}
