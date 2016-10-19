/**
 * Authenticates (true/false) access operation (r/w/d) to a path based on JWT.
 * 
 */

var jwt = require("jsonwebtoken");

module.exports = {

    isAuthorisedOperation: function(path, operation, token) {
        var claims = jwt.verify(token, "secret");
        var isAuthorised = false;
        Object.keys(claims).forEach(function (claim) {
            console.log(claim+"="+claims[claim]);
            isAuthorised = path.indexOf(claim) === 0 && claims[claim].indexOf(operation)>-1;
        });
        console.log(isAuthorised);
        return isAuthorised;
    }
    
};