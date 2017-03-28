
const express = require('express');
const router = express.Router();
const db = require('../server/db').db()


router.get('/api/surveys/:id',getSurvey);

function getSurvey(req,res,next){
	if (!req.isAuthenticated()) {
   		res.status(401).json({error:'not logged in'});
  	}
	db.one('select * from surveys where id = $1',parseInt(req.params.id))
	    .then(function (data) {
	      res.status(200).json(data);
	   })
	   .catch(function (err) {
	      return next(err);
	});
}

module.exports = router;