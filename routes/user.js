const authHelpers = require('../server/auth/_helpers');
const passport = require('../server/auth/local');

const express = require('express');
const router = express.Router();

router.post('/api/login',login);
router.post('/api/register',register);
router.get('/api/puppies', getAllPuppies);
router.get('/api/loggedIn',getCurrentUser);
router.post('/api/updateUser',updateUser);
router.get('/api/logout',logout);
router.post('/api/changePassword',changePassword);

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

function updateUser(req,res,next) {
  if (req.user) {
    let id = req.user.id;
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
        res.status(200).json(user);
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
        if (user) { res.status(200).json(user); } 
        else if (err) { res.status(500).json(err); }
      })(req, res, next);
    })
    .catch(function (err) {
           res.status(500).json(err);
    });
}

module.exports = router;