var got = require("got");
var nonodeify = require("nonodeify");
var env = require("./lib/env");
var debug = require("./lib/debug");
var Promise = require('pinkie-promise');
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

      debug("adding", address, data);

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

      debug("removing", address, data);

      // So we can query if it's started globally
      return got.delete("http://"+address, {body: JSON.stringify(data)})
        .catch(function(err) {
          throw handleError(err)
        })
        .then(checkPoweredBy)
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

			if(env.is("development")) {
				debug("setup");

				// On exit remove yourself
				function exit(code) {          
          debug("caught exit");
					self.remove(hostMap, function() {
						process.exit();            
					});
				} 

				process.on("beforeExit", exit);
				process.on('SIGINT', exit);    

				return this.add(hostMap)
          .then(done.then)
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
				return Promise.resolve()
          .then(done.then)
          .catch(done.catch);
			}
		}
  };
}
