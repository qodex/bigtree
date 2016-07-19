const fs = require("fs");
const stream = require("stream");
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

    if(fs.existsSync(filePath(path))) fs.unlinkSync(filePath(path));

    var writable = fs.createWriteStream(filePath(path));
    return writable;
};

this.deletePath = function(path, jwt) {
    if(!auth.isAuthorisedOperation(path, this.DELETE_OPERATION, jwt)) throw "access denied";

    var fileName = filePath(path);
    console.log("deleting ", fileName);
    var isDirectory = fs.statSync(fileName).isDirectory();
    console.log(isDirectory?"directory delete":"file delete");
    if(isDirectory) {
        rmdir(fileName);
    } else {
        fs.unlinkSync(fileName);
    }
};

function filePath(path) {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']+"/.bigTree"+path;
}

/**
 * Returns a readable stream that contain a folder and its sub folders as a JSON object with files and their contents
 * as fields and values
 *
 * @param path - absolute path on the local drive
 */
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
};

function fileAsJSON(path) {
    return fs.createReadStream(path).pipe(escTransform());
};

function rmdir(path) {
    if( fs.existsSync(path) ) {
        console.log("file exists, deleting ", path);
        fs.readdirSync(path).forEach(function(file,index) {
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                rmdir(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        console.log("rmdirSync ", path);
        fs.rmdirSync(path);
    }
};

//dirAsJSON("bigTree").pipe(process.stdout)

//console.log(fs.rmdirSync(filePath("/bigTree/aaa/bbb/aaa/drei/ein")));