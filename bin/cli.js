#!/usr/bin/env node
var yargs     = require("yargs");
var bouncyMgr = require("../");

var argv = yargs
  .describe("port", "port to start on")
  .alias("p", "port")
  .argv;

bouncyMgr.start(argv.port, function(server) {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

function exit(code) {
  bouncyMgr.stop(function() {
    process.exit();
  });
}

process.on("beforeExit", exit);
process.on('SIGINT', exit);
