var http = require("http"),
    fs = require("fs"),
    path = require("path"),
    URL = require("url"),
    async = require("async"),
    configAarray,url, stringDate, fileUrl, realPath, ext, pathname, reDate,
    server;

function creSer(){
    server = http.createServer(function (request, response) {
        url = URL.parse(request.url);
        realPath = path.join("", url.pathname);
        ext = path.extname(realPath);
        pathname = url.pathname;
        reDate = request.headers["if-modified-since"];
        ext = ext ? ext.slice(1) : 'unknown';

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

                for(var i = 0; i < configAarray.length; i++){
                    if (ext.match(configAarray[i].fileMatch)) {
                        var expires = new Date();
                        expires.setTime(expires.getTime() + configAarray[i].maxAge * 1000);
                        response.setHeader("Expires",expires.toUTCString());
                        response.setHeader("Cache-Control","max-age=" + configAarray[i].maxAge);
                    }
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
}

exports.createServer = function(port, configs){
    configAarray = configs;
    creSer();
    return server.listen(port);
}
