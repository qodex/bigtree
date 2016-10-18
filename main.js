var http = require("http");
var WebSocketServer = require("ws").Server;
var BigTreeFS = require("./BigTreeFS");
var PubSubService = require("./PubSubService");
var AccessControlService = require("./AccessControlService");

var fs = new BigTreeFS();
var pubSub = new PubSubService();
var auth = new AccessControlService(fs);

var port = 3001;

var server = http.createServer(function(req, res) {
    var path = req.url;
    var jwt = "";

    if("GET" === req.method) {
        try {
            if (!auth.isAuthorisedOperation(path, this.READ_OPERATION, jwt)) throw "access denied";
            res.setHeader("Content-Type", "text/html;charset=utf-8");
            var readable = fs.readPath(req.url);
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
            if(!auth.isAuthorisedOperation(path, this.WRITE_OPERATION, jwt)) throw "access denied";
            var writable = fs.writePath(path);
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
            if(!auth.isAuthorisedOperation(path, this.DELETE_OPERATION, jwt)) throw "access denied";
            fs.deletePath(path);
            pubSub.publish(path, path);
            res.end("ok");
        } catch(e) {
            console.log("Error: ", path, e.code);
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
