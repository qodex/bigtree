/**
 * Authenticates (true/false) access operation (r/w/d) to a path based on JWT.
 * To secure a path, add the path under /secure. If /secure/test/path exists, calls to /test/path/* will require
 * Authorization token (JWT) present in HTTP header "Authorisation". 
 * 
 */

var jwt = require("jsonwebtoken");
var btfs = require("./BigTreeFS");

module.exports = {

    READ: "r",
    WRITE: "w",
    DELETE: "d",
    
    isAuthorisedOperation: function(path, operation, token) {
        var isAuthorised = false;
        if(isPathSecured(path)) {
            try {
                var claims = jwt.verify(token, "secret");
                Object.keys(claims).forEach(function (claim) {
                    var isPathUnderClaim = path.indexOf(claim.charAt(claim.length - 1) === '/' ? claim : claim + "/") === 0;
                    if ((path === claim || isPathUnderClaim) && claims[claim].indexOf(operation) > -1) {
                        isAuthorised = true;
                    }
                });
            } catch (e) {
                // jwt token can't be parsed
            }
        } else {
            isAuthorised = true;
        }

        return isAuthorised;
    }
    
};

/**
 * A <path> is secured if /secure/+<path> exists. If a path is secured, all sub paths are secured too.
 * If a path is secured, all requests to it must supply Authorization token in HTTP header
 * @param path
 * @returns {boolean}
 */
function isPathSecured(path) {
    var result = true;
    try {
        var readable = btfs.read("/secure" + path);
    } catch (e) {
        if(e==="ENOENT") result = false;
    }

    if(!result) {
        var pathSplit = path.split("/");
        pathSplit.pop(); //remove last
        var parentPath = pathSplit.join("/");
        result = parentPath.length>0? isPathSecured(parentPath) : false;
    }

    return result;
}