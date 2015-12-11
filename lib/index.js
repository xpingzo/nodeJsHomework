var http = require("http");
var fs = require("fs");
var path = require("path");
var URL = require("url");
var async = require("async");
var config = {
    fileMatch: /^(gif|png|jpg|js|css)$/ig,
    maxAge: 60*60*24*365
};

var server = http.createServer(function (request, response) {
    var url = URL.parse(request.url);
    var stringDate ;
    var realPath = path.join("assets", url.pathname);
    var ext = path.extname(realPath);

    ext = ext ? ext.slice(1) : 'unknown';

    var pathname = url.pathname;
    var reDate = request.headers["if-modified-since"];

    if(pathname == "/"){
        pathname = "/index.html";
    }
    var fileUrl = "../demo/static"+pathname;
    async.waterfall([
        function(callback){
            fs.lstat(fileUrl, function(err, stats){
                if(err){
                    callback(new Error("File Error"));
                    response.end("404 file not exist");
                }
                else{
                    stringDate = stats.mtime;
                    stringDate = stringDate.toUTCString();

                    if(stats.isDirectory()) {
                        fileUrl += "/index.html";
                    }
                    callback(null);
                }
            });
        }
        ,
        function(callback){
            fs.exists(fileUrl, function(exists){
                if(!exists){
                    callback(new Error("File Error"));
                    response.end("404 file not exist");
                }
                callback(null);

            });
        }
        ,function(callback){
            fs.readFile(fileUrl, function(err, data){
                if(err){
                    callback(new Error("File Error"));
                    console.log(err);
                    //return error;
                }
                else{
                    //ͨ������max-age�����ļ����л��棬�����������������������������
                    // ��ͨ�ã�ҵ���ԱȽ�ǿ�����ǵķ�������ܺ����ж���Щ������Ҫ�����ֻ���

                    if (ext.match(config.fileMatch)) {
                        var expires = new Date();
                        expires.setTime(expires.getTime() + config.maxAge * 1000);
                        response.setHeader("Expires",expires.toUTCString());
                        response.setHeader("Cache-Control","max-age=" + config.maxAge);
                    }
                    response.write(data);

                    //ʹ��last-modified��if-modified-since�����ж��������Ƿ��ȡ����
                    // if(reDate != stringDate){
                    //     response.setHeader("Last-Modified", stringDate);
                    //     response.writeHead(200);
                    //     response.write(data);
                    // }
                    //else{
                    //    response.writeHeader(304);
                    // }

                }
                response.end();
            });
            callback(null);
        }
    ], function(err, results){
        console.log(err);
    })
});
exports.createServer = function(port){
    return server.listen(port);
}