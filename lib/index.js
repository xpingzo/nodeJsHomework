var http = require("http");
var fs = require("fs");
var path = require("path");
var URL = require("url");
var async = require("async");
var _config;

var server = http.createServer(function (request, response) {
    var url = URL.parse(request.url);
    var stringDate, fileUrl ;
    var realPath = path.join("", url.pathname);
    var ext = path.extname(realPath);

    ext = ext ? ext.slice(1) : 'unknown';

    var pathname = url.pathname;
    var reDate = request.headers["if-modified-since"];

    async.waterfall([
        function(callback) {
            if (pathname.slice(-1) === "/") {
                pathname += "index.html";
            }
            fileUrl = "../demo/static" + pathname;
            fs.lstat(fileUrl, callback);
        },
        function (stats, callback) {
            stringDate = stats.mtime;
            stringDate = stringDate.toUTCString();
            //判断该路径是文件还是文件夹，若是文件夹，则添加到该文件下的index.html
            if (stats.isDirectory()) {
                fileUrl += "/index.html";
            }
            fs.exists(fileUrl, function(exists){
                callback(null,exists);
            });
        },
        function(exists, callback) {
            if (!exists) {
                callback(new Error("File Error"));
                response.end("404 file not exist");
            }
            fs.readFile(fileUrl, callback);
        },
        function(data,callback){

            //通过设置max-age来对文件进行缓存，不过，这个方法不跟服务器交互，
            // 不通用，业务性比较强，我们的服务器框架很难判断哪些场景下要用这种缓存

            if (ext.match(_config.fileMatch)) {
                var expires = new Date();
                expires.setTime(expires.getTime() + _config.maxAge * 1000);
                response.setHeader("Expires",expires.toUTCString());
                response.setHeader("Cache-Control","max-age=" + _config.maxAge);
            }
            response.write(data);

            //使用last-modified跟if-modified-since进行判断来决定是否读取缓存
            // if(reDate != stringDate){
            //     response.setHeader("Last-Modified", stringDate);
            //     response.writeHead(200);
            //     response.write(data);
            // }
            //else{
            //    response.writeHeader(304);
            // }
            response.end();
            callback();
        }
    ], function(err){
        if(err){
            //console.log(err);
            response.end("404 file not exist");
        }

    })
});
exports.createServer = function(port, config){
    _config = config;
    return server.listen(port);
}