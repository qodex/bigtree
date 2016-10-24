var auth = require("./AccessControlService");

auth.authenticate("/path/to/no/where", auth.READ, "").then(function(path ){
    console.log("good "+path);
}).catch(function () {
    console.log("not good");
})