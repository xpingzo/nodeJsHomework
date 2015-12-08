var http = require("http");
var fs = require("fs");
var path = require("path");
var URL = require("url");


var server = http.createServer(function (request, response) {
    var url = URL.parse(request.url);
    var stringDate ;

    var pathname = url.pathname;
    var reDate = request.headers["if-modified-since"];

    if(pathname == "/"){
        pathname = "/index.html";
    }
    var fileUrl = "../demo/static"+pathname;

    fs.lstat(fileUrl, function(err, stats){
       
        if(err){
            response.end("404 file not exist");
        }
        else{
            stringDate = stats.mtime;
            stringDate = stringDate.toUTCString();

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
                             if(reDate != stringDate){
                                 response.setHeader("Last-Modified", stringDate);
                                 response.writeHead(200);
                             }
                            else{
                                response.writeHeader(304);
                             }
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