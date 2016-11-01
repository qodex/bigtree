var assert = require("assert");
var btfs = require("../BigTreeFS");

describe("BigTreeFS", function () {

    var path = "/btfstest/value";

    describe("write() and read()", function () {
        it("can write and read", function (done) {
            btfs.write(path).write("I can write", function () {
                var readable = btfs.read(path);
                readable.on("data", function (chunk) {
                    if("I can write" === chunk) done();
                });
            });
        });
    });

    describe("read()", function () {
        it("can make a JSON", function (done) {
            var readable = btfs.read("/btfstest/");
            var json = "";
            readable.on("data", function (chunk) {
                json+=chunk;
            });
            readable.on("end", function () {
                if("{value:\"I can write\"}" === json) done();
            });
            readable.resume();
        });
    });

    describe("delete()", function () {
        it("can delete", function (done) {
            btfs.delete(path);
            try {
                btfs.read(path);
            } catch(e) {
                if("ENOENT"===e) done();
            }
        });
    });

});