const passport = require('passport');

var db = require('../db').db()

module.exports = () => {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.one('select * from users where id = $1', id)
    .then((user) => { done(null, user); })
    .catch((err) => { done(err,null); });
	});
}