var http = require("http");
var fs = require("fs");
var path = require("path");
var URL = require("url");


var server = http.createServer(function (request, response) {
    var url = URL.parse(request.url);

    var pathname = url.pathname;

    if(pathname == "/"){
        pathname = "/index.html";
    }
    var fileUrl = "../demo/static"+pathname;

    fs.lstat(fileUrl, function(err, stats){
        console.log(err);
        if(err){
            response.end("404 file not exist");
            //console.log(err);
        }
        else{
            if(stats.isDirectory()){
                fileUrl += "/index.html";
            }
            fs.exists(fileUrl, function(exists){
                if(exists){
                    fs.readFile(fileUrl, function(err, data){
                        if(err){
                            console.log(err);
                        }
                        else{
                            response.write(data);
                        }
                        response.end();
                    });
                }
                else{
                    response.end("404 file not exist");
                }
            });
        }

    });



});


exports.createServer = function(port){
    return server.listen(port);
}