var http = require("http");
var WebSocketServer = require("ws").Server;
var btfs = require("./BigTreeFS");
var pubSub = require("./PubSubService");
var auth = require("./AccessControlService");

var port = 3001;

var server = http.createServer(function(req, res) {
    var path = req.url;
    var authToken = req.headers['authorization'];
    authToken = authToken ? authToken.substring("Bearer ".length) : authToken;

    if("GET" === req.method) {
        try {
            if (!auth.isAuthorisedOperation(path, "r", authToken)) throw "access denied";
            res.setHeader("Content-Type", "text/html;charset=utf-8");
            var readable = btfs.read(req.url);
            readable.pipe(res);
            readable.on("error", function () {
                res.statusCode = 404;
            });
        } catch (e) {
            if(e === "access denied") res.statusCode=403;
            else if (e.code === "ENOENT" || e === "ENOENT") res.statusCode=404;
            else res.statusCode=503;
            res.end();
        }
        
    } else if("POST" === req.method) {
        try {
            if(!auth.isAuthorisedOperation(path, "w", authToken)) throw "access denied";
            var writable = btfs.write(path);
            req.pipe(writable);
            req.on("end", function () {
                res.end("ok");
                pubSub.publish(path, path);
            });
        } catch (e) {
            if(e === "access denied") res.statusCode=403;
            else if (e.code === "ENOENT") res.statusCode=404;
            else res.statusCode=503;
            res.end();
        }
        
    } else if("DELETE" === req.method) {
        try {
            if(!auth.isAuthorisedOperation(path, "d", authToken)) throw "access denied";
            btfs.delete(path);
            pubSub.publish(path, path);
            res.end("ok");
        } catch(e) {
            if(e === "access denied") res.statusCode=403;
            else if (e.code === "ENOENT") res.statusCode=404;
            else res.statusCode=503;
            res.end();
        }
        
    }
});

var wss = new WebSocketServer({server: server});

wss.on("connection", function(ws){
    pubSub.subscribe(ws.upgradeReq.url, function (message) {
        ws.send(message);
    });
});

server.listen(port, function() {
    console.log("BigTree server started in port "+port);
});
