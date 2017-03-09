const bcrypt = require('bcryptjs');

var pgp = require('pg-promise');
var db = require('../db').db()

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function createUser(req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return db.none(`insert into users(username,password)
      values($1, $2)`,
      [req.body.username,hash])
}

module.exports = {
  comparePass,
  createUser
};