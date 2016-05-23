var tmpCerts = require("./lib/insert-certificate");
var EventEmitter = require("events");
var etchosts = require("etchosts");
var collect  = require('stream-collect');
var templates = require("./lib/templates");
var httpProxy = require('http-proxy');
var http  = require("http");
var https = require("https");
var url = require("url");
var pkg = require("./package.json");
var Remarkable = require('remarkable');
var fs = require("fs");

var lodash = {
  assign: require("lodash.assign"),
  filter: require("lodash.filter"),
  map:    require("lodash.map")
};


var readmeRaw = fs
  .readFileSync("./README.md")
  .toString()
  .replace(/([^!])\[([^\]]*)\]\(([^)]*)\)/g, function() {
    var firstChar = RegExp.$1;
    var linkName  = RegExp.$2;
    var linkUrl   = RegExp.$3;

    if(linkUrl.match(/^[^http]/)) {
      linkUrl = "https://github.com/orangemug/manage-hosts/blob/master/"+linkUrl;
    }
    return firstChar+"["+linkName+"]("+linkUrl+")";
  });

var md = new Remarkable();
var readme = md.render(readmeRaw);


var ADDRESS_REGEXP = require("./lib/address-regexp");
var HOST           = "manage.hosts";
var APP_NAME       = "manage.hosts";

var config = {};
var hosts = [{
  domains: [HOST],
  ip: "127.0.0.1"
}];

function setHosts(done) {
  etchosts.add(APP_NAME, hosts, done);
}

function add(data, done) {
  config = lodash.assign(config, data);
  for(var key in data) {
    var val = data[key];
    hosts.push({
      domains: [key],
      // Because all /etc/hosts need to redirect to this server.
      ip: "127.0.0.1"
    });
  }
  setHosts(done);
}

function remove(data, done) {
  data.forEach(function(domain) {
    delete config[domain];
  });

  hosts = lodash.filter(hosts, function(item) {
    if(data.indexOf(item.domains[0]) > -1) {
      return false;
    }
    return true;
  });
  setHosts(done);
}

module.exports.start = function(opts, done) {
  var httpPort  = opts.httpPort  === undefined ? 80  : opts.httpPort;
  var httpsPort = opts.httpsPort === undefined ? 443 : opts.httpsPort;

  var proxy = httpProxy.createProxyServer();

  proxy.on('error', function(err, req, res) {
    console.error("ERR: %s", err);
  });

  function hdl(req, res) {
    res.setHeader("x-powered-by", "manage-hosts");

    // This simulates an operation that takes 500ms to execute
    var host = req.headers.host;

    if(host === HOST || host.match(ADDRESS_REGEXP)) {
      if(req.url.match(/^\/goto\/(.*)$/)) {
        var parsedUrl = url.parse(RegExp.$1);
        if(!parsedUrl || !parsedUrl.hostname || !parsedUrl.path) {
          res.statusCode = 400;
          res.end("Invalid url passed to /goto");
          return;
        }

        // Override host & url
        host = parsedUrl.hostname;
        req.url = parsedUrl.path;
      } else if(req.method === "POST") {
        collect(req, function(body) {
          var body = JSON.parse(body);
          add(body, function() {
            res.statusCode = 200;
            res.end();
          })
        });
        return;
      } else if(req.method === "DELETE") {
        collect(req, function(body) {
          var body = JSON.parse(body);
          remove(body, function() {
            res.statusCode = 200;
            res.end();
          });
        });
        return;
      } else if(req.method === "GET" && req.url.match(/^\/$/)) {
        res.statusCode = 200;
        res.end(templates.list({
          appName: APP_NAME,
          pkg: pkg,
          readme: readme,
          apps: lodash.map(config, function(redirect, href) {
            return {
              // TODO: Add protocol here...
              href: "http://"+href,
              redirect: redirect
            };
          })
        }));
      }
    }

    if(config.hasOwnProperty(host)) {
      var prototol = "https";
      if(!req.secure) {
        prototol = "http";
      }
      var redirectUrl = prototol+"://"+config[host];
      console.log("redirecting to:", redirectUrl+req.url);
      proxy.web(req, res, {
        target: redirectUrl
      });
    } else {
      res.statusCode = 404;
      res.end('not found');
    }
  }

  function close(oldClose, done) {
  }

  function doneCb(err) {
    setHosts(function() {
      done(undefined);
    })
  }

  var httpServer = http
    .createServer(hdl)
    .listen(httpPort, "127.0.0.1")

  var httpsServer;

  tmpCerts
    .replace("manage.hosts.tmp-cert", {
      altNames: [
        "development-www.sequor.io",
        "manage.hosts"
      ]
    })
    .then(function(keys) {
      console.log(">>>HERE", keys)
      httpsServer = https
        .createServer({
          key: keys.serviceKey,
          cert: keys.certificate
        }, hdl)
        .listen(httpsPort, "127.0.0.1", doneCb)

      fs.writeFileSync(__dirname+"/pub.key", keys.certificate);

      httpsServer.on("error", function(data) {
        emitter.emit("error", data);
      });
    });


  var emitter = new EventEmitter;


  httpServer.on("error", function(data) {
    emitter.emit("error", data);
  });

  emitter.address = function() {
    return {
      http:  httpServer.address(),
      https: httpsServer.address(),
    }
  };

  emitter.close = function(done) {
    etchosts.remove(APP_NAME, function() {
      var count = 0;
      function _done(err) {
        if(err) {
          return done(err);
        }
        else {
          count++;
        }
        if(count === 2) {
          done(undefined);
        }
      }

      httpServer.close(_done);
      httpsServer.close(_done);
    });
  }

  return emitter;
};

