var fs = require("fs");
var auth = require("./AccessControlService");

this.READ_OPERATION = "r";
this.WRITE_OPERATION = "w";
this.DELETE_OPERATION = "d";

this.readPath = function(path, jwt) {
    if(!auth.isAuthorisedOperation(path, this.READ_OPERATION, jwt)) throw "access denied";
    var fileName = __dirname+path;
    var readable = fs.createReadStream(fileName);
    return readable;
};

this.writePath = function(path, jwt) {
    if(!auth.isAuthorisedOperation(path, this.WRITE_OPERATION, jwt)) throw "access denied";
    var fileName = __dirname+path;
    var writable = fs.createWriteStream(fileName);
    return writable;
};

this.deletePath = function(path, jwt) {
    if(!auth.isAuthorisedOperation(path, this.DELETE_OPERATION, jwt)) throw "access denied";
    var fileName = __dirname+path;
        fs.unlinkSync(fileName);
};