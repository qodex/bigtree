var fs = require("./BigTreeFS");
this.isAuthorisedOperation = function(path, operation, jwt) {

    return jwt? operation === fs.READ_OPERATION : true;
}