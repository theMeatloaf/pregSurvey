
var db
module.exports.db = function() {
    if (db == null) {
      var pgp = require('pg-promise')();
//      var connectionString = 'postgres://localhost:5432/puppies';
	 var connectionString = 'postgres://iaxxikyhixtwny:d5ca15b3169e47472ea96a585e64b7b1f591dab0a8cfbcd24a4d23f2414f6d98@ec2-54-235-119-27.compute-1.amazonaws.com:5432/d2dmunbjf7e31h';
      db = pgp(connectionString);
    }
    return db
};