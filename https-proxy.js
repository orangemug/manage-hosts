var http = require('http'),
    net = require('net'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    util = require('util');

var proxy = httpProxy.createServer();

var server = http.createServer(function (req, res) {
  util.puts('Receiving reverse proxy request for:' + req.url);

  req.originalUrl = req.url;
  proxy.proxyRequest(req, res, {target: {
    host: url.parse(req.url).hostname,
    port: url.parse(req.url).port
  }, secure: false});
}).listen(8000);

//https://github.com/nodejitsu/node-http-proxy/blob/master/examples/http/reverse-proxy.js
server.on('connect', function (req, socket) {
  util.puts('Receiving reverse proxy request for:' + req.url);

  var serverUrl = url.parse('https://' + req.url);

  var srvSocket = net.connect(serverUrl.port, serverUrl.hostname, function() {
    socket.write('HTTP/1.1 200 Connection Established\r\n' +
    'Proxy-agent: Node-Proxy\r\n' +
    '\r\n');
    srvSocket.pipe(socket);
    socket.pipe(srvSocket);
  });
});
