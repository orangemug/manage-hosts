#!/usr/bin/env node
var yargs       = require("yargs");
var manageHosts = require("../server");

var argv = yargs
  .usage('Usage: $0 <command> [options]')
  .describe("port", "port to start on")
  .alias("p", "port")
  .default("p", 80)
  .help('h')
  .alias('h', 'help')
  .argv;


var server = manageHosts.start(argv.port, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

server.on("error", function(err) {
  if(err.code && err.code === "EACCES") {
    console.error("You haven't got access to run on port '"+argv.port+"', you probably need to run as the root user, you probably want")
    console.error("\n  sudo "+argv.$0+"\n")
    process.exit(2);
  } else {
    console.error(err);
    process.exit(1);
  }
})

function exit(code) {
  server.close(function() {
    // Clear ^C from term and exit
    console.log();
    process.exit();
  });
}

process.on("beforeExit", exit);
process.on('SIGINT', exit);
