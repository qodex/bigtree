const fs = require("fs");
const stream = require("stream");
const util = require("util");
const auth = require("./AccessControlService");
const combStream = require("combined-stream");
const escTransform = require("./EscapeTransformStream");


this.READ_OPERATION = "r";
this.WRITE_OPERATION = "w";
this.DELETE_OPERATION = "d";

this.readPath = function(path, jwt) {
    if(!auth.isAuthorisedOperation(path, this.READ_OPERATION, jwt)) throw "access denied";
    var fileName = filePath(path);
    var readable;
    if(fs.existsSync(fileName) && fs.statSync(fileName).isDirectory()) readable = dirAsJSON(fileName);
    else readable = fs.createReadStream(fileName, "utf8");
    return readable;
};

this.writePath = function(path, jwt) {
    if(!auth.isAuthorisedOperation(path, this.WRITE_OPERATION, jwt)) throw "access denied";
    var writable = fs.createWriteStream(filePath(path));
    return writable;
};

this.deletePath = function(path, jwt) {
    if(!auth.isAuthorisedOperation(path, this.DELETE_OPERATION, jwt)) throw "access denied";
    fs.unlinkSync(filePath(path));
};

function filePath(path) {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']+"/.bigTree"+path;
}

function dirAsJSON(path) {
    var comb = combStream.create();
    comb.append("{");
    var files = fs.readdirSync(path);
    for(var i=0; i<files.length; i++) {
        var file = files[i];
        var isDirectory = fs.statSync(path+"/"+file).isDirectory();
        var readableValue = isDirectory?dirAsJSON(path+"/"+file):fileAsJSON(path+"/"+file);
        comb.append(file+":");
        if(!isDirectory) comb.append("\"");
        comb.append(readableValue);
        if(!isDirectory) comb.append("\"");
        if(i<files.length-1) comb.append(",");
    }
    comb.append("}");
    return comb;
}

function fileAsJSON(path) {
    return fs.createReadStream(path).pipe(escTransform());
}


//dirAsJSON("bigTree").pipe(process.stdout)
