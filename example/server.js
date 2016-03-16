var express = require("express");
var Promise = require('pinkie-promise');

/**
 * Just a test server.
 */
module.exports = function start(opts) {
  var port = opts.port;

  return new Promise(function(resolve, reject) {
    var host;
    var app = express();

    app.get('/*', function (req, res) {
      res.send("Hello world from<br>port: "+port+"<br>url: "+req.path);
    });

    var server = app.listen(port, function () {
      host = server.address().address;
      port = server.address().port;
      console.log('Example app listening at http://%s:%s', host, port);
      resolve();
    });
  });
};
