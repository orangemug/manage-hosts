var express = require('express');

module.exports = function start(port) {
  var app = express();

  app.get('/*', function (req, res) {
    res.send("Hello world from, port:", port, "url:", req.url);
  });
  var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
}

