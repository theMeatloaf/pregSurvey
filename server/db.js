
var db
module.exports.db = function() {
    if (db == null) {
      var pgp = require('pg-promise')();
      var connectionString = 'postgres://localhost:5432/puppies';
      db = pgp(connectionString);
    }
    return db
};