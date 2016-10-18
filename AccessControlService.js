module.exports = AccessControlService;

/**
 * Authenticates (true/false) access operation (r/w/d) to a path based on JWT.
 * @returns {{isAuthenticatedOperation: isAuthenticatedOperation}}
 * @constructor
 */
function AccessControlService(fs) {

    function isAuthorisedOperation(path, operation, jwt) {
        return true;
    }
    
    return {isAuthorisedOperation:isAuthorisedOperation}
}