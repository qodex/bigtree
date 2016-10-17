module.exports = PubSub;

function PubSub() {
    
    var topics = {};

    function publish(topic, message) {
        console.log("publish to "+topic+": "+message);
        Object.keys(topics).forEach(function (item) {
            console.log(" - "+ item)
            if(topic.indexOf(item) ===0) {
                console.log("listener "+item+" matches "+topic);
                topics[item].forEach(function (topicListener) {
                    topicListener(message);
                })
            }
        });
    }

    function subscribe(topic, listener) {
        if(!topics[topic]) topics[topic] = [];
        topics[topic].push(listener);
        console.log("Subscribed to "+topic+", listeners count: "+topics[topic].length);
        return function () {
            var index = topics.indexOf(listener);
            if(index>-1) topics.splice(index, 1);
        }
    }
    
    return {
        publish: publish,
        subscribe: subscribe
    };
}


