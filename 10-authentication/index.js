
var fs = require('fs');
var koa = require('koa');
var path = require('path');
var bodyParser = require('koa-bodyparser');
var CSRF = require('koa-csrf');
var session = require('koa-session');

var app = module.exports = koa();

// we need to set the `.keys` for signed cookies and the cookie-session module
app.keys = ['secret1', 'secret2', 'secret3'];

var form = fs.readFileSync(path.join(__dirname, 'form.html'), 'utf8');

// use koa-session somewhere at the top of the app
app.use(session());

app.use(bodyParser());

// add the CSRF middleware
app.use(new CSRF({
  invalidSessionSecretMessage: 'Invalid session secret',
  invalidSessionSecretStatusCode: 403,
  invalidTokenMessage: 'Invalid CSRF token',
  invalidTokenStatusCode: 403,
  excludedMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
  disableQuery: false
}));

app.use(function* home(next) {
  if (this.request.path !== '/') return yield next;

  if (!this.session.authenticated) this.throw(401, 'user not authenticated');

  this.response.body = 'hello world';
})

/**
 * If successful, the logged in user should be redirected to `/`.
 */

app.use(function* login(next) {
  if (this.request.path !== '/login') return yield* next;

  // Handle GET request
  if (this.request.method === 'GET') {
    return this.response.body = form.replace('{{csrf}}', this.csrf);
  }

  // Handle POST request
  if (this.request.method === 'POST')  {
    let username = this.request.body.username || undefined;
    let password = this.request.body.password || undefined;

    // Validate user login credentials
    if (username !== 'username' || password !== 'password') {
      this.session.authenticated = false; // Just to be safe
      this.throw(400, 'bad username or password');
    }

    // Authenticate and redirect back to the home page
    this.session.authenticated = true;
    this.response.status = 303;
    this.response.redirect("/");
  }
    
})

/**
 * Let's 303 redirect to `/login` after every response.
 * If a user hits `/logout` when they're already logged out,
 * let's not consider that an error and rather a "success".
 */

app.use(function* logout(next) {
  if (this.request.path !== '/logout') return yield* next;
  
  this.session.authenticated = false;
  this.response.status = 303;
  this.response.redirect("/login")
})

/**
 * Serve this page for browser testing if not used by another module.
 */

if (!module.parent) app.listen(process.env.PORT || 3000);
