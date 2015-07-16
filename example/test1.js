var express = require('express');
var bouncyMgr = require("../");
var app = express();

app.get('/', function (req, res) {
	  res.send('Hello World!');
});

function start() {
	var server = app.listen(3000, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
	});
}

var hostMap = {
	"test1.develop": "127.0.0.1:3000"
};

function exit(code) {
	bouncyMgr.remove(hostMap, function() {
		process.exit();
	});
}

process.on("beforeExit", exit);
process.on('SIGINT', exit);


bouncyMgr.add(hostMap, function(err) {
	if(err) {
		console.log("Please start bouncy-manager");
		return;
	}
	start();
})
