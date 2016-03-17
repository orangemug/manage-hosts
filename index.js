var got = require("got");
var nonodeify = require("nonodeify");
var env = require("./lib/env");
var debug = require("./lib/debug");
var Promise = require('pinkie-promise');
var nonodeify = require("nonodeify");
var promiseProps = require("promise-props");
var getPort = require("get-port");


var ADDRESS_REGEXP = require("./lib/address-regexp");

function checkPoweredBy(res) {
  if(res.headers["x-powered-by"] !== "manage-hosts") {
    var err = new Error("Response not from manage-hosts app missing 'x-powered-by' header");
  }
  return res;
}

function defaultPort(url) {
  url.hostname = url.hostname || "127.0.0.1";

  if(!url.port || url.port == 0) {
    return getPort()
    .then(function(port) {
      url.port = port
      return url;
    })
  } else {
    return url;
  }
}

function defaultHostMaps(hostMap) {
  var newHostMap = {};
  for(var k in hostMap) {
    var newKey = k.replace(/\{env\}/g, "development");
    newHostMap[newKey] = defaultPort(hostMap[k])
  }
  return newHostMap;
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
    throw "Port not defined";
  }


  function flattenData(data) {
    var newData = {};
    for(var k in data) {
      newData[k] = data[k].hostname + ":" + data[k].port;
    }
    return newData;
  }

  return {
    add: function(data, done) {
      var newData = flattenData(data);
      done = nonodeify(done);

      debug("adding", address, data);


      // So we can query if it's started globally
      return got.post("http://"+address, {body: JSON.stringify(newData)})
        .catch(function(err) {
          throw handleError(err)
        })
        .then(checkPoweredBy)
        .then(function() {
          // Return the original host map
          return data;
        })
        .then(done.then)
        .catch(done.catch);
    },
    remove: function(data, done) {
      var newData = flattenData(data);
      done = nonodeify(done);

      if(!Array.isArray(newData)) {
        newData = Object.keys(newData);
      }

      debug("removing", address, newData);

      // So we can query if it's started globally
      return got.delete("http://"+address, {body: JSON.stringify(newData)})
        .catch(function(err) {
          throw handleError(err)
        })
        .then(checkPoweredBy)
        .then(function() {
          return data;
        })
        .then(done.then)
        .catch(done.catch);
    },
    /**
     * If you're accessing this via a server you may be may not be going via
     * /etc/hosts, in the browser this will resolve to `<url>` and on the
     * server `http://<managehosts-ip>/goto/<url>`
     */
    resolve: function(url) {
      if(env.isBrowser()) {
        return url;
      } else {
        return "http://"+address+"/goto/"+url;
      }
    },
    /**
     * This will setup manage-hosts in development and tear down on exit.
     * @param done the callback
     * @return Promise
     */
    setup: function(hostMap, done) {
      var self = this;
      done = nonodeify(done);

      var ret;

      hostMap = defaultHostMaps(hostMap);

      if(env.is("development")) {
        debug("setup");

        // On exit remove yourself
        function exit(code) {          
          debug("caught exit");
          console.log("Trying to remove hosts from manage-hosts");
          self.remove(hostMap, function() {
            process.exit();            
          });
        } 

        process.on("beforeExit", exit);
        process.on('SIGINT', exit);    

        ret = promiseProps(hostMap)
          .then(this.add.bind(this))
          .catch(function(err) {
            console.error("================================================================================================");
            console.error("manage-hosts is not running, please download/install <https://github.com/orangemug/manage-hosts>");
            console.error("================================================================================================");
            return Promise.reject(err);
          })
          .catch(done.catch);
      } else {
        debug("skipping");
        // Early exit because we've in development
        ret = promiseProps(hostMap)
          .catch(done.catch);
      }

      return ret.then(function(data) {
        var out = {};
        for(var k in data) {
          var item = data[k];
          out[k] = item.handler(item)
            .then(function() {
              return data[k];
            });
        }
        return promiseProps(out);  
      })
      .then(done.then)
    }
  };
}
