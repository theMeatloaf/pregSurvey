const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const init = require('./passport');
const authHelpers = require('./_helpers');

var db = require('../db').db()

init();

passport.use(new LocalStrategy({}, (username, password, done) => {
  // check to see if the username exists
  username = username.toLowerCase();
  db.one('select * from users where username = $1', username)
    .then((user) => { 
      if (!user) return done(null, false);
      if (!authHelpers.comparePass(password, user.password)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
    .catch((err) => { return done(err); });
}));

module.exports = passport;