
const express = require('express');
const router = express.Router();
const db = require('../server/db').db()


router.post('/api/createListen',create);
router.get('/api/findSessions',find);


function create(req,res,next) {
  if (!req.isAuthenticated()) {
    res.status(401).json({error:'not logged in'});
  }

  db.one('insert into listen_session(length,date,user_id) values($1,$2,$3) RETURNING *',[req.body.length,req.body.date,req.user.id])
    .then(function (data) {
      res.status(200).json(data);
    }).catch(function(err) {
      return next(err);
    });
}

function find(req,res,next) {
  if (!req.isAuthenticated()) {
    res.status(401).json({error:'not logged in'});
  }

  db.many('select * from listen_session where user_id = $1 limit $2 offset $3',[req.query.userID,req.query.limit,req.query.offset])
   .then(function (data) {
      res.status(200).json(data);
    }).catch(function(err) {
      return next(err);
    });
}




module.exports = router;