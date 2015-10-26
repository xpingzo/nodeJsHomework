var http = require("http");
var fs = require("fs");
var path = require("path");
var URL = require("url");

http.createServer(function(request, response){
	var url = URL.parse(request.url);
	var pathname = url.pathname;
	if(pathname == "/"){
		pathname = "/index.html";
	}
	fs.exists("file"+pathname, function(exists){
		if(exists){
			fs.readFile("file"+pathname, function(err, data){
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
	})
	
	
}).listen(8888);