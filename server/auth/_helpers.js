const bcrypt = require('bcryptjs');

var pgp = require('pg-promise');
var db = require('../db').db()

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function forgotPassword(req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.newPassword, salt);

  return db.one(`select * from users where forgotpass_token=$1`,[req.body.forgotPassCode]).then(function (user) {
       db.none(`update users set password=$1, forgotpass_token = null where forgotpass_token=$2`, [hash,req.body.forgotPassCode]);
    });

}

function updatePassword(req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.newPassword, salt);

  return db.none(`update users set password=$1 where id=$2`, [hash,req.user.id])
}

function createInitialPassword(req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);

  return db.none(`update users set password=$1, invite_token = null, phone=$2, notifications_email=$3, notifications_sms=$4 where invite_token=$5`, [hash,req.body.phone,req.body.emailNotifications,req.body.smsNotifications,req.body.invite_token])
}

function createUser(req) {
  var username = req.body.username;
  username = username.toLowerCase();
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return db.none(`insert into users(username,password,notifications_email,next_survey_date,next_survey_position)
      values($1, $2,true,$3,1)`,
      [username,hash,new Date()])
}

module.exports = {
  comparePass,
  createUser,
  updatePassword,
  createInitialPassword,
  forgotPassword
};