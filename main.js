var http = require("http");
var WebSocketServer = require("ws").Server;
var fs = require("./BigTreeFS");

var port = 3002;

var server = http.createServer(function(req, res) {
    var path = req.url;
    var auth = "";

    if("GET" === req.method) {
        res.setHeader("Content-Type", "text/html;charset=utf-8");
        var readable = fs.readPath(req.url, auth);
        readable.pipe(res);
        readable.on("error", function () {
            res.statusCode=404;
            res.end();
        });
        
    } else if("POST" === req.method) {
        try {
            var writable = fs.writePath(path, auth);
            req.pipe(writable);
            req.on("end", function () {
                res.end("ok");
            });
        } catch (e) {
            res.statusCode=500;
            res.end(e);
        }
    } else if("DELETE" === req.method) {
        try {
            fs.deletePath(path, auth);
        } catch(e) {
            console.log("Error: ", path, e.code);
            if(e === "access denied") res.statusCode=403; 
            else if (e.code === "ENOENT") res.statusCode=404;
            else res.statusCode=503;
        }
        res.end("ok");
    }
});

var wss = new WebSocketServer({server: server});

wss.on("connection", function(ws){
    console.log(ws.upgradeReq.url);
    ws.send("babaganush");
});

server.listen(port, function() {
    console.log("BigTree server started in port "+port);
});
