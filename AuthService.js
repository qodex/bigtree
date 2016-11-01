/**
 * Authenticates access to a path for an operation using promise: 
 *      auth.authenticate("/path/to/value", auth.READ, "").then(successFunc).catch(errorFunc);
 *      
 * To secure read, write, delete and/or listen access to a path add file __r, __w, __d and/or __l to the path.
 * The value of the file is the secret to validate tokens with. If it's the same secret for all operations then client
 * can use a single JWT token signed with the secret for all operations.
 * 
 */

var jwt = require("jsonwebtoken");
var btfs = require("./BigTreeFS");

module.exports = {

    READ: "r",
    WRITE: "w",
    DELETE: "d",
    LISTEN: "l",

    authenticate: function(path, operation, token) {
        return new Promise(function(resolve, reject) {
           getSecret(path, operation).then(function (secret) {
               try {
                   var claims = jwt.verify(token, secret);
                   Object.keys(claims).forEach(function (claim) {
                       var isPathUnderClaim = path.indexOf(claim.charAt(claim.length - 1) === '/' ? claim : claim + "/") === 0;
                       if ((path === claim || isPathUnderClaim) && claims[claim].indexOf(operation) > -1) {
                           resolve();
                       }
                   });
                   reject();
               } catch (e) {
                   reject(); // Token can't be parsed
               }
           }).catch(function () {
               resolve(); //if no secret found then path is not secured so authentication passes.
           });
        });
    }
    
};

/**
 * Look for file like __r, __w, __d or __l recursively up the path, resolve to file value if file is found, reject if not.
 * If exists, the file must contain the secret to verify JWT tokens with. 
 *
 * @param path
 * @returns {Promise}
 */
function getSecret(path, operation) {
    return new Promise(function (resolve, reject) {
        try {
            var readable = btfs.read(path + "/__"+operation);
            var secret="";
            readable.on("data", function (chunk) {
                secret += chunk;
            });
            readable.on("end", function () {
                resolve(secret);
            });
        } catch (e) {
            var pathSplit = path.split("/");
            pathSplit.pop(); //remove last
            var parentPath = pathSplit.join("/");
            if(parentPath.length>0) {
                getSecret(parentPath, operation).then(resolve).catch(reject);
            } else {
                reject(e);
            }
        }
    });
}
