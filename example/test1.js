var manageHosts = require("../")();
var server = require("./server");


manageHosts
  .setup({
    "group2-test1-{env}.example.com": {
      hostname: "127.0.0.1",
      handler: server
    },
    "group2-test2-{env}.example.com": {
      hostname: "127.0.0.1",
      handler: server
    },
    "group2-test3-{env}.example.com": {
      hostname: "127.0.0.1",
      handler: server
    }
  })
  .then(function() {
    console.log("All servers started")
  });
