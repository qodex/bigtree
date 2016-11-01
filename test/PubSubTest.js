var assert = require("assert");
var pubSub = require("../PubSubService");

describe("PubSubService", function () {
   
    describe("#publish()", function () {
        it("publishes to subscribers", function (done) {
            pubSub.subscribe("/test1", function (message) {
                if("hallo"===message) done();
            });
            pubSub.publish("/test1/stuff", "hallo");
        });
    });

    describe("#subscribe", function () {
        it("returns unsubscribe function", function (done) {
            var unsubscribe = pubSub.subscribe("/test2", function (message) {
                throw "subscribe callback was called after unsubscribe()";
            });
            unsubscribe();
            pubSub.publish("/test2/unsubscribe", "hallo");
            done();
        });
    });

});