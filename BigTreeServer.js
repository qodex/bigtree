/**
 * BigTree server.
 * BigTree is a web persistence and messaging platform for integration, big data and responsive web app development.
 */

var http = require("http");
var WebSocketServer = require("ws").Server;
var btfs = require("./BigTreeFS");
var pubSub = require("./PubSubService");
var auth = require("./AccessControlService");

module.exports = BigTreeServer;

function BigTreeServer(port) {
    
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

        auth.authenticate(ws.upgradeReq.url, auth.LISTEN, "").then(function() {
            // If authenticated with empty token then path is not secured, subscribe to listen to events
            pubSub.subscribe(ws.upgradeReq.url, function (message) {
                ws.send(message);
            });

        }).catch(function() {
            //If path is secured, wait for token from client then authenticate and subscribe
            ws.on("message", function(msg){
                auth.authenticate(ws.upgradeReq.url, auth.LISTEN, msg).then(function () {
                    pubSub.subscribe(ws.upgradeReq.url, function (message) {
                        ws.send(message);
                    });
                }).catch(function () {
                    ws.close();
                });
            });

        });
    });

    server.listen(port, function() {
        console.log("BigTree server started on port "+port);
    });

    return {
        "version":"1.0"
    }
}