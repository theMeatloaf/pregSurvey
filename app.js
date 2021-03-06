var express = require('express');
var session = require('cookie-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var api = require('./routes/user');
var api2 = require('./routes/survey');
var api3 = require('./routes/listenSession');

var app = express();
var passport = require('passport');

/* Redirect http to https */
app.get('*', function(req,res,next) {
  if(req.headers['x-forwarded-proto'] != 'https' && process.env.BASE_URL != 'http://localhost:3000') {
    console.log("work");
    res.redirect('https://'+req.hostname+req.url)
  } else {
    next() /* Continue to other routes if we're not redirecting */
  }
});

require('dotenv').config()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public', {
  extensions: ['html']
}));
app.use(session({
  secret: process.env.SECRET_SESSION_KEY
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', api);
app.use('/', api2);
app.use('/', api3);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handling

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  //render the error page
  res.status(err.status || 500);
  if (process.env.NODE_ENV != 'production') {
      res.render('error');
  } else {
      res.render('error_live');
  }
});

// development error handler
// will print stacktrace
if (process.env.NODE_ENV != 'production') {
  app.use(function(err, req, res, next) {
    res.status( err.code || 500 )
    .json({
      status: 'error',
      message: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  .json({
    status: 'error',
    message: err.message
  });
});

module.exports = app;
