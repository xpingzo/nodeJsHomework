var server = require("../lib/index"),
    port = 9999,
    port2 = 8888;

var configs = [
    {
        suffix: /^jpg$/ig,
        maxAge: 60*60*24*365
    },
    {
        suffix: /^js$/ig,
        maxAge: 60*60*24*12
    },
    {
        suffix: /^css$/ig,
        maxAge: 60*60*24*30
    }
];
var configs2 = [
    //{
    //    suffix: /^jpg$/ig,
    //    maxAge: 60*60*24*365
    //},
    {
        suffix: /^js$/ig,
        maxAge: 60*60*24*12
    },
    {
        suffix: /^css$/ig,
        maxAge: 60*60*24*30
    }
];
var server1 = server.createServer(port, configs);
var server2 = server.createServer(port2, configs2);