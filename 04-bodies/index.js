
var fs = require('fs');
var koa = require('koa');

var app = module.exports = koa();

// Yieldable version of `fs.stat()`
stat = function (filename) {
  return new Promise((resolve, reject) => {
      fs.stat(filename, (err, stats) => {
          if (err) {
              reject(err);
          }

          resolve(stats);
      });
  });
};

/**
 * Create the `GET /stream` route that streams this file.
 * In node.js, the current file is available as a variable `__filename`.
 */

app.use(function* (next) {
  if (this.request.path !== '/stream') return yield* next;

  var stats = yield stat(__filename);
  this.response.type = "application/javascript";
  this.response.body = fs.createReadStream(__filename);
  this.response.length = stats.size;
});

/**
 * Create the `GET /json` route that sends `{message:'hello world'}`.
 */

app.use(function* (next) {
  if (this.request.path !== '/json') return yield* next;

  this.response.body = {
    message: 'hello world'
  };
});

//app.listen(3000);