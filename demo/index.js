var server = require("../lib/index");
var port = 9999;
var config = {
    fileMatch: /^(gif|png|jpg|js|css)$/ig,
    maxAge: 60*60*24*365
};

var server1 = server.createServer(port, config);