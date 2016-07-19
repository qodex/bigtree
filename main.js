var http = require("http");
var fs = require("./BigTreeFS");

var port = 3001;

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
        var writable = fs.writePath(path, auth);
        req.pipe(writable);
        req.on("end", function () {
            res.end("ok");
        });

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
server.listen(port, function() {
    console.log("BigTree server started in port "+port);
});
