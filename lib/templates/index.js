var fs         = require("fs");
var Handlebars = require("handlebars");

module.exports = {
	list: Handlebars.compile(
		fs.readFileSync(__dirname+"/list.hbs").toString()
	)
};
