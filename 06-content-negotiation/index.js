var koa = require('koa');

/**
 * This is a promisified version of zlib's gzip function,
 * allowing you to simply `yield` it without "thunkifying" it.
 *
 *   app.use(function* (next) {
 *     this.response.set('Content-Encoding', 'gzip');
 *     this.response.body = yield gzip('something');
 *   })
 */
//var gzip = require('mz/zlib').gzip;
var zlib = require('zlib');

var app = module.exports = koa();

gzip = function(buf) {
    return new Promise((resolve, reject) => {
        zlib.gzip(buf, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
}

app.use(function* (next) {
    if (this.request.acceptsEncodings('gzip')) {
        this.response.set('Content-Encoding', 'gzip');
        this.response.body = yield gzip('hello world');
    } 
    else if (this.request.acceptsEncodings('identity')){
        this.response.set('Content-Encoding', 'identity');
        this.response.body = 'hello world';
    }
    else {
        yield* next;
    }
});

//app.listen(3000);
