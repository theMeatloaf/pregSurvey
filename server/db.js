require('dotenv').config()

var db
module.exports.db = function() {
    if (db == null) {
      var pgp = require('pg-promise')();
	  var connectionString = process.env.DATABASE_URL;
      db = pgp(connectionString);
    }
    return db
};