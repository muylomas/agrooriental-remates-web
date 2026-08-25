const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');

const crons = require('./crons/scheduler');

const routes = require('./routes/index');

const web_login = require('./routes/auth/login');
const web_register = require('./routes/auth/register');
const web_resetPass = require('./routes/change-password');
const web_logout = require('./routes/logout');

const web_criollosparaganar = require('./routes/criollosparaganar');

// Controlled development
const web_customers = require('./routes/customers');
const web_societies = require('./routes/societies');
const web_farms = require('./routes/farms');
const web_cattle = require('./routes/cattle');
const web_accounts = require('./routes/accounts');

// Google Auth
//const google_auth = require('./routes/auth/google');

// API
const api_accounts = require('./routes/api/accounts');
const api_addresses = require('./routes/api/addresses');
const api_customers = require('./routes/api/customers');
const api_societies = require('./routes/api/societies');
const api_farms = require('./routes/api/farms');
const api_users = require('./routes/api/users');
const api_search = require('./routes/api/search');
const api_cattle = require('./routes/api/cattle');
const api_comments = require('./routes/api/comments');

const app = module.exports = express();
const http = require('http').Server(app);

app.disable('view cache');

app.use(function (req, res, next) {
  if (req.secure) {
    next();
  } else {
    if (req.url.indexOf(".well-known/acme-challenge") != -1) {
      next();
    }
    else if (req.subdomains.length) {
      res.redirect('https://' + req.subdomains.reverse().join(".") + '.agrooriental.uy' + req.url);
    }
    else if (req.headers.host.indexOf("equinos.agrooriental.uy") != -1) {
      res.redirect('https://equinos.agrooriental.uy' + req.url);
    }
    else
      next();
  }
});

const sslOptions = {
  ca: fs.readFileSync('/etc/ssl/equinos_chain.pem'),
  key: fs.readFileSync('/etc/ssl/equinos_privkey.pem'),
  cert: fs.readFileSync('/etc/ssl/equinos_cert.pem'),
  requestCert: false,
  rejectUnauthorized: false
};

const https = require('https').Server(sslOptions, app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(logger('dev'));

// This was commented and added to enable large files to be posted to the
// server.
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.raw({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());

// Gzip/Brotli-compress responses (HTML, JSON, JS, CSS) before they go over
// the wire. Big win for load time with zero risk: images/fonts are already
// compressed and the `compression` filter skips them automatically.
app.use(compression());

// Assets built by `npm run build:assets` (see scripts/build-assets.js).
// Filenames are content-hashed, so they can be cached "forever" — a new
// build always gets a new filename, no manual `?ver=` bumping needed.
app.use('/dist', express.static(path.join(__dirname, 'public-dist'), {
  maxAge: '1y',
  immutable: true,
}));

// Everything else under /public (vendor libs, fonts, images, unbuilt
// assets). Not hashed, so we use a shorter cache window rather than
// "immutable" to avoid serving stale content if a file changes.
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
}));

// Reads the manifest written by scripts/build-assets.js once at startup
// (same lifecycle as a `pm2 reload`, which is how this app already picks
// up code changes). Use in views as `asset('/remate/scripts.js')` — it
// resolves to the minified, hashed /dist path when one exists, or falls
// back to the original path otherwise (e.g. before the first build, or
// for files the build step intentionally skips).
let assetManifest = {};
try {
  assetManifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'public-dist', 'manifest.json'), 'utf8'));
} catch (e) {
  console.warn('[assets] public-dist/manifest.json not found — run `npm run build:assets`. Falling back to unminified assets.');
}
app.locals.asset = (originalPath) => assetManifest[originalPath] || originalPath;

const middleware_authentication = require('./middlewares/authentication');

// add & configure middleware
const sessionMiddleware = session({
  genid: (req) => {
    //console.log('Inside session middleware genid function')
    //console.log(`Request object sessionID from client: ${req.sessionID}`)
    return uuid(); // use UUIDs for session IDs
  },
  store: new FileStore(),
  secret: 'LoktOOtNBvuFajNrBnx4',
  cookie: {
    maxAge: (new Date(Date.now() + (24 * 60 * 60))).getTime(),
    domain: 'equinos.agrooriental.uy',
  },
  resave: false,
  name: "agroOrientaApp",
  saveUninitialized: true,
});

app.use(sessionMiddleware);


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use(middleware_authentication.authProcc);

app.use('/', routes);
app.use('/index', routes);
app.use('/index.html', routes);
app.use('/index.php', routes);

app.use('/usuario', web_customers);

app.use('/sociedades', web_societies);

app.use('/establecimientos', web_farms);

app.use('/ganado', web_cattle);

app.use('/cuentas', web_accounts);

//app.use('/auth/google', google_auth);

app.use('/login', web_login);
app.use('/ingresar', web_login);
app.use('/registro', web_register);
app.use('/reset-password', web_resetPass);
app.use('/logout', web_logout);

app.use('/criollosparaganar', web_criollosparaganar);

//API
app.use('/api/accounts', api_accounts);
app.use('/api/addresses', api_addresses);
app.use('/api/customers', api_customers);
app.use('/api/societies', api_societies);
app.use('/api/farms', api_farms);
app.use('/api/users', api_users);
app.use('/api/search', api_search);
app.use('/api/cattle', api_cattle);
app.use('/api/comments', api_comments);

// mercado-agro Sockets
const socketIo = require('socket.io')(https);
app.set('socketapp', socketIo);
socketIo.on('connect', require('./models/sockets/customerSocket'));
socketIo.on('connection', require('./models/sockets/disconnection'));
socketIo.on('connection', require('./models/sockets/auctionBid'));
socketIo.on('connection', require('./models/sockets/chatManager'));

// Capture All 404 errors
app.use(function (req, res, next) {
  res.status(404);
  err.status = 404;
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stack traces leaked to user
app.use(function (err, req, res, next) {
  // respond with html page
  if (req.accepts('html')) {
    // This is to render a custom page
    res.render('404', { url: req.url });
    //res.redirect('/');
    return;
  }

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

https.listen(8080, function () {
  console.log('listening on *:8080');
});

module.exports = app;
