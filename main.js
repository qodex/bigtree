/**
 * Main BigTree executable.
 * BigTree is a web persistence and messaging platform for integration, big data and responsive web app development.
 */

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
        auth.authenticate(path, auth.READ, authToken).then(function() {
            res.setHeader("Content-Type", "text/html;charset=utf-8");
            var readable = btfs.read(req.url);
            readable.pipe(res);
            readable.on("error", function () {
                res.statusCode = 404;
                res.end();
            });
        }).catch(function () {
            res.statusCode=403;
            res.end();
        });
        
    } else if("POST" === req.method) {
        auth.authenticate(path, auth.WRITE, authToken).then(function() {
            var writable = btfs.write(path);
            req.pipe(writable);
            req.on("end", function () {
                res.end("ok");
                pubSub.publish(path, path);
            });
        }).catch(function () {
            res.statusCode=403;
            res.end();
        });
        
    } else if("DELETE" === req.method) {
        auth.authenticate(path, auth.WRITE, authToken).then(function() {
            btfs.delete(path);
            pubSub.publish(path, path);
            res.end("ok");
        }).catch(function () {
            res.statusCode=403;
            res.end();
        });
    }
});

var wss = new WebSocketServer({server: server});

/**
 * Clients can connect over websockets to listen to path changes
 */
wss.on("connection", function(ws) {

    /**
     * If the path is not secured, subscribe immediately.
     * If the path is secured, expect authentication token from client
     * as the first and only message. Subscribe if valid, disconnect if not.
     */
    if(auth.isAuthorisedOperation(ws.upgradeReq.url, auth.READ, "")) {
        pubSub.subscribe(ws.upgradeReq.url, function (message) {
            ws.send(message);
        });
    } else {
        ws.on("message", function(msg){
            //First and only message from the client should contain authentication token.
            if(auth.isAuthorisedOperation(ws.upgradeReq.url, auth.READ, msg)) {
                pubSub.subscribe(ws.upgradeReq.url, function (message) {
                    ws.send(message);
                });
            } else {
                ws.close();
            }
        });
    }
});

server.listen(port, function() {
    console.log("BigTree server started in port "+port);
});
