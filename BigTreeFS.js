const fs = require("fs");
const stream = require("stream");
const auth = require("./AccessControlService");
const combStream = require("combined-stream");
const escTransform = require("./EscapeTransformStream");
const rimraf = require("rimraf");
const mkdirp = require("mkdirp");

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

    var dirPath = filePath(path.substring(0, path.lastIndexOf('/')));
    try {
        mkdirp.sync(dirPath, function () {
            console.log("Created path", path);
        });
        if(fs.existsSync(filePath(path))) fs.unlinkSync(filePath(path));
        var writable = fs.createWriteStream(filePath(path));
        return writable;
    } catch(e) {
        throw "Unable to create path "+path;
    }

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
    rimraf(path, function(){
        console.log(new Date(), "deleted", path);
    });
};
