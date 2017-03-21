const authHelpers = require('../server/auth/_helpers');
const passport = require('../server/auth/local');

const express = require('express');
const router = express.Router();

router.post('/api/login',login);
router.post('/api/register',register);
router.get('/api/puppies', getAllPuppies);
router.get('/api/loggedIn',getCurrentUser);
router.post('/api/updateUser',updateUser);

const db = require('../server/db').db()

function getAllPuppies(req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(500).json({error:'not logged in'});
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

function updateUser(req,res,next) {

  if (req.user) {
    let id = req.user.id;
    db.none('update users set phone=$1 where id=$2',
    [req.body.phone,id]).then(function () {
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
    res.status(200).json(req.user);
  } else {
    res.status(500).json({error:'not logged in'});
  }
}

function login(req, res, next) {
  if (!req.body.password || !req.body.username) {
    res.status(500).json({error:'Please enter both a Username and Password'});
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
    res.status(500).json({error:'Please enter both a Username and Password'});
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