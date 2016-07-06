var Transform = require('stream').Transform;
var inherits = require('util').inherits;

module.exports = Escape;

function Escape(options) {
    if ( ! (this instanceof Escape))
        return new Escape(options);

    if (! options) options = {};
    options.objectMode = true;
    Transform.call(this, options);
}

inherits(Escape, Transform);

Escape.prototype._transform = function _transform(obj, encoding, callback) {
    try {
        obj = obj.toString().replace(/\n/g, "\\n")
            //.replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/&/g, "\\&")
            .replace(/\r/g, "")
            .replace(/\t/g, "\\t");
    } catch(err) {
        return callback(err);
    }

    this.push(obj);
    callback();
};