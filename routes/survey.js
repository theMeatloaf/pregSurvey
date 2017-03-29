
const express = require('express');
const router = express.Router();
const db = require('../server/db').db()


router.get('/api/surveys/:id',getSurvey);
router.get('/api/completeSurvey',completeSurvey);

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

function completeSurvey(req,res,next){
	if (!req.isAuthenticated()) {
   		res.status(401).json({error:'not logged in'});
   		return;
  	}
  	//need to get user's next survey, get it's next, get user and calculate date, update date it's next survey ID
  	db.one('select * from surveys where id = $1',parseInt(req.user.next_survey_id))
	    .then(function (survey) {
	    	if(survey.next_id && survey.days_till_next) {
		    	var nextSurvey = survey.next_id
		    	var nextDate = new Date(req.user.next_survey_date);
	    		nextDate.setDate(nextDate.getDate() + survey.days_till_next);

	    		//check real quick to make sure they aren't trying to cheat now...
	    		var now = new Date();
	    		if (now < req.user.next_survey_date) {
	    			res.status(401).json({error:'no cheating now...'});
	    			return;
	    		} 

	    		//ok were good...update the user with the next due dates etc
	    		db.none('update users set next_survey_date=$1, next_survey_id=$2 where id=$3',
			    [nextDate,nextSurvey,req.user.id]).then(function () {
			      res.status(200)
			        .json({
			          status: 'success',
			          message: "Updated User"
			        });
			    })
			    .catch(function (err) {
			      return next(err);
			    });
	    	} else {
	    		res.status(200).json({status:'success',message:'Out Of Surveys'});
	    	}
	   })
	   .catch(function (err) {
	      return next(err);
	});

}

module.exports = router;