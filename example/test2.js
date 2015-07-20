var manageHosts = require("../")();
var server = require("./server");

var hostMap = {
	"group1-test1.develop": "127.0.0.1:9671",
	"group1-test2.develop": "127.0.0.1:9672",
	"group1-test3.develop": "127.0.0.1:9673"
};

function exit(code) {
	manageHosts.remove(hostMap, function() {
		process.exit();
	});
}

process.on("beforeExit", exit);
process.on('SIGINT', exit);

manageHosts.add(hostMap, function(err) {
	if(err) {
		console.log("Please start bouncy-manager");
		return;
	}

  [9671, 9672, 9673].forEach(function(port) {
    server(port);
  });
})
