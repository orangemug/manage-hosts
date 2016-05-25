var httpProxy = require('http-proxy');
var http = require("http");
var url = require("url");



var parseHostHeader = function (headersHost, defaultPort) {
  var hostAndPort = headersHost.split(':'),
  targetHost = hostAndPort[0],
  targetPort = parseInt(hostAndPort[1]) || defaultPort;

  return {hostname: targetHost, port: targetPort, host: headersHost};
};

function hdl(req, res) {
  console.log(">>>>>> HERE");

  var proxy = httpProxy.createServer();
  var urlParts = parseHostHeader(req.headers['host']);

  var target = {
    host: urlParts.hostname,
    port: urlParts.port,
  };

  proxy.on("error", function(err) {
    console.log(err);
  })

  req.originalUrl = req.url;
  var out = proxy.proxyRequest(req, res, {
    target: target
  }, function(err) {
    console.log("here", err);
    res.statusCode = 500;
    res.end(err.toString());
  })
  console.log(out);
}

http
  .createServer(hdl)
  .listen(8000);

