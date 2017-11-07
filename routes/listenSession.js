
const express = require('express');
const router = express.Router();
const db = require('../server/db').db()


router.post('/api/createListen',create);

function create(req,res,next) {
  if (!req.isAuthenticated()) {
  res.status(401).json({error:'not logged in'});
  }

  //get max position
  db.one('insert into listen_session(length,date,user_id) values($1,$2,$3) RETURNING *',[req.body.length,req.body.date,req.user.id])
    .then(function (data) {
      res.status(200).json(data);
    }).catch(function(err) {
      return next(err);
    });
}

module.exports = router;