var jwt = require("jsonwebtoken");
var btfs = require("./BigTreeFS");

module.exports = {

    READ: "r",
    WRITE: "w",
    DELETE: "d",

    authenticate: function(path, operation, token) {
        return new Promise(function(resolve, reject) {
           getSecret(path).then(function (secret) {
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
 * Look for file '_secure' recursively up the path, resolve to file value if file is fund, reject if not.
 * If exists file '_secure' must contain the secret to verify JWT tokens with
 *
 * @param path
 * @returns {Promise}
 */
function getSecret(path) {
    return new Promise(function (resolve, reject) {
        try {
            var readable = btfs.read(path + "/_secure");
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
                getSecret(parentPath).then(resolve).catch(reject);
            } else {
                reject(e);
            }
        }
    });
}
