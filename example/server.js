var express = require('express');

module.exports = function start(port) {
  var port, host;
  var app = express();

  app.get('/*', function (req, res) {
    res.send("Hello world from<br>port: "+port+"<br>url: "+req.path);
  });
  var server = app.listen(port, function () {
    console.log(server.address())
    host = server.address().address;
    port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
}

