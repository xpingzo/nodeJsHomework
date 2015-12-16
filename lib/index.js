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
            //�жϸ�·�����ļ������ļ��У������ļ��У�����ӵ����ļ��µ�index.html
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

            //ͨ������max-age�����ļ����л��棬�����������������������������
            // ��ͨ�ã�ҵ���ԱȽ�ǿ�����ǵķ�������ܺ����ж���Щ������Ҫ�����ֻ���

            if (ext.match(_config.fileMatch)) {
                var expires = new Date();
                expires.setTime(expires.getTime() + _config.maxAge * 1000);
                response.setHeader("Expires",expires.toUTCString());
                response.setHeader("Cache-Control","max-age=" + _config.maxAge);
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