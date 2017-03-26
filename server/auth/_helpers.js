const bcrypt = require('bcryptjs');

var pgp = require('pg-promise');
var db = require('../db').db()

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function updatePassword(req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.newPassword, salt);

  return db.none(`update users set password=$1 where id=$2`, [hash,req.user.id])
}

function createUser(req) {
  var username = req.body.username;
  username = username.toLowerCase();
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return db.none(`insert into users(username,password)
      values($1, $2)`,
      [username,hash])
}

module.exports = {
  comparePass,
  createUser,
  updatePassword
};