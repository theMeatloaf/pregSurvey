const authHelpers = require('../server/auth/_helpers');
const passport = require('../server/auth/local');
const request = require('request');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

require('dotenv').config()

router.post('/api/login',login);
router.post('/api/register',register);
router.get('/api/puppies', getAllPuppies);
router.get('/api/loggedIn',getCurrentUser);
router.post('/api/updateUser',updateUser);
router.get('/api/logout',logout);
router.post('/api/changePassword',changePassword);
router.post('/api/createPassword',createInitialPassword);
router.post('/api/inviteUser',invite);
router.get('/api/findInvitation',findInvitation);
router.get('/api/findUser',findUser);
router.post('/api/forgotPassword',forgotPassword);
router.post('/api/executeForgotPass',executeForgotPassword);
router.post('/api/optOut',optOut);
router.post('/api/optIn',optIn);

const db = require('../server/db').db()

function getAllPuppies(req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401).json({error:'not logged in'});
  }
  db.any('select * from pups')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL puppies'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function changePassword(req,res,next) {
    if (!req.isAuthenticated()) {
      res.status(401).json({error:'not logged in'});
    } else if (!req.body.oldPassword || !req.body.newPassword) {
      res.status(400).json({error:'provide old and new password'});
    }

    if(authHelpers.comparePass(req.body.oldPassword,req.user.password)) {
      authHelpers.updatePassword(req)
          .then(function() {
            res.status(200).json({status:'success',message:'password updated!'});
          }).catch(function(err){
            res.status(500).json(err);
          });
    } else {
        res.status(400).json({status:'failed',message:'Old Password is incorrect'});
    }
}

function createInitialPassword(req,res,next) {

    authHelpers.createInitialPassword(req)
          .then(function() {
            res.status(200).json({status:'success',message:'password created!'});
          }).catch(function(err){
            res.status(500).json(err);
          });
}

function updateUser(req,res,next) {
  if (req.user) {
    let id = req.user.id;
    if (req.body.id) {
      id = req.body.id;
    }
    db.none('update users set phone=$1, notifications_email=$2, notifications_sms=$3 where id=$4',
    [req.body.phone,req.body.emailNotifications,req.body.smsNotifications,id]).then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated User'
        });
    })
    .catch(function (err) {
      return next(err);
    });
  }

}

function getCurrentUser(req, res, next) {
  if (req.user) {
    var user = req.user
    delete user.password;
    res.status(200).json(user);
  } else {
    res.status(500).json({error:'not logged in'});
  }
}

function logout (req, res, next){
  req.session.destroy(function (err) {
    res.status(200)
        .json({
          status: 'success',
          message: 'Logged Out User'
        });
  });
}

function login(req, res, next) {
  if (!req.body.password || !req.body.username) {
    res.status(400).json({error:'Please enter both a Username and Password'});
    return;
  }
  passport.authenticate('local', (err, user, info) => {
    if (!user || err) { res.status(404).json({error:"Incorrect Username Password Combo"}); }
    if (user) {
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        //make sure their account is active....
        if (user.permission_level != -1) {
            res.status(200).json(user);
        } else {
            res.status(401).json({error:"Your user account has been opted out of the study."})
        }
      });
    }
  })(req, res, next);
}

function register(req, res, next) {
  if (!req.body.password || !req.body.username) {
    res.status(400).json({error:'Please enter both a Username and Password'});
    return;
  }
  
  authHelpers.createUser(req).then(function () {
      passport.authenticate('local', (err, user, info) => {
        if (user) {  delete user.password; res.status(200).json(user); } 
        else if (err) { res.status(500).json(err); }
      })(req, res, next);
    })
    .catch(function (err) {
           res.status(500).json(err);
    });
}
  
function optOut(req,res,next) {
  if (!req.user || req.user.permission_level != 1) {
      res.status(401).json({error:'not authorized to view this data'});
      return;
  } else if (!req.body.id) {
    res.status(401).json({error:'must pass userId'});
    return;
  }
  db.none('update users set permission_level=$1 where id=$2',
    [-1,req.body.id]).then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated User'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

  
function optIn(req,res,next) {
  if (!req.user || req.user.permission_level != 1) {
      res.status(401).json({error:'not authorized to view this data'});
      return;
  } else if (!req.body.id) {
    res.status(401).json({error:'must pass userId'});
    return;
  }
  db.none('update users set permission_level=$1 where id=$2',
    [0,req.body.id]).then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated User'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function findUser(req,res,next) {
  if (!req.user || req.user.permission_level != 1) {
      res.status(401).json({error:'not authorized to view this data'});
      return;
  } else if (!req.query.email) {
    res.status(401).json({error:'must pass email'});
    return;
  }

  db.many(`select * from users where username like $1`,'%'+req.query.email+'%')
    .then(function (data) {
      for (var i = data.length - 1; i >= 0; i--) {
        delete data[i].password;
      };
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function findInvitation(req,res,next) {
  if (!req.query.inviteCode) {
    res.status(401).json({error:'must pass invite code'});
    return;
  }

  db.many(`select * from users where invite_token = $1`,req.query.inviteCode)
    .then(function (data) {
      for (var i = data.length - 1; i >= 0; i--) {
        delete data[i].password;
      };
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function invite(req,res,next) {
  //first make invitation hash
  const salt = bcrypt.genSaltSync();
  var now = new Date();
  const hashVal = req.body.username+now.toString();
  const hash = bcrypt.hashSync(hashVal, salt);

  db.none(`insert into users(username,notifications_email,next_survey_date,next_survey_id,invite_token)
      values($1,true,$2,1,$3)`,
      [req.body.username,new Date(),hash]).then(function (user) {
          //this worked...lets email them
          emailInvite(req.body.username,hash,res);
    })
    .catch(function (err) {
        res.status(500).json(err);
    });
}

function executeForgotPassword(req,res,next) {
    authHelpers.forgotPassword(req)
        .then(function() {
          res.status(200).json({status:'success',message:'password changed!'});
        }).catch(function(err){
          res.status(500).json(err);
        });
}

function forgotPassword(req,res,next) {
  //make forgot passord hash
  const salt = bcrypt.genSaltSync();
  var now = new Date();
  const hashVal = req.body.username+now.toString();
  const hash = bcrypt.hashSync(hashVal, salt);

  db.none(`update users set forgotpass_token=$1 where username=$2`,
    [hash,req.body.username]).then(function () {
        //alright set the token lets send them the email
        emailForgotPassword(req.body.username,hash,res);
    })
    .catch(function (err) {
      return next(err);
    });
}

function emailForgotPassword(address,token,res) {
  var API_URL = "https://api:"+process.env.MAILGUN_API_KEY+"@api.mailgun.net/v3/" + process.env.MAILGUN_DOMAIN + "/messages";
  
  var inviteUrl = 'http://localhost:3000/forgotPassword?code='+token;

  request.post(API_URL,
    { form: { from: 'test@test.de', to: address, subject:'heyo maggots', text:inviteUrl  } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json({mailgunResponse:body});
        } else {
          res.status(500).json(error);
        }
    }
  );
}

function emailInvite(address,token,res) {
  var API_URL = "https://api:"+process.env.MAILGUN_API_KEY+"@api.mailgun.net/v3/" + process.env.MAILGUN_DOMAIN + "/messages";
  
  var inviteUrl = 'http://localhost:3000/settings?inviteCode='+token;

  request.post(API_URL,
    { form: { from: 'test@test.de', to: address, subject:'heyo maggots', text:inviteUrl  } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(200).json(body);
        } else {
          res.status(500).json(error);
        }
    }
  );
}

module.exports = router;