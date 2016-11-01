/**
 * Tree-like Publish/Subscribe service.
 * Subscribers notified with paths that changed under the subscribed path. For example, if subscribed to /test/path
 * and /test/path/value had changed, subscriber receives '/test/path/value'. Subscriber will not be notified
 * if  /test/some/value changed.
 *
 */

var topics = {};

module.exports = {
    
    publish: function(topic, message) {
        Object.keys(topics).forEach(function (item) {
            if(topic.indexOf(item) ===0) {
                topics[item].forEach(function (topicListener) {
                    topicListener(message);
                })
            }
        });
    },

    /**
     * @param topic - Path name, e.g. '/test/path' to listen for changes under.
     * @param listener - callback function, receives path that had changed.
     * @returns {Function} - Unsubscribe function
     */
    subscribe: function(topic, listener) {
        if(!topics[topic]) topics[topic] = [];
        topics[topic].push(listener);
        console.log("Subscribed to "+topic+", listeners count: "+topics[topic].length);
        return function () {
            var index = topics[topic].indexOf(listener);
            if(index>-1) topics[topic].splice(index, 1);
        }
    }

};


