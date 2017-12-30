
var koa = require('koa');

var app = module.exports = koa();

app.use(function* () {
    this.response.body = (this.request.is('application/json'))
        ? {message: 'hi!'}
        : 'ok';
});