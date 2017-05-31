
const express = require('express');
const router = express.Router();
const db = require('../server/db').db()


router.get('/api/surveys/:id',getSurvey);
router.get('/api/completeSurvey',completeSurvey);
router.get('/api/getSurveys',getallSurveys);
router.get('/api/newSurvey',newSurvey);
router.get('/api/surveys/shiftUp/:id',moveSurveyUp);
router.get('/api/surveys/shiftDown/:id',moveSurveyDown);
router.post('/api/updateSurvey',updateSurvey);
router.delete('/api/surveys/:id',deleteSurvey);

function getSurvey(req,res,next){
	if (!req.isAuthenticated()) {
   		res.status(401).json({error:'not logged in'});
  	}
	db.one('select * from surveys where position = $1',parseInt(req.params.id))
	    .then(function (data) {
	      res.status(200).json(data);
	   })
	   .catch(function (err) {
	      return next(err);
	});
}

function deleteSurvey(req,res,next) {
	if (!req.isAuthenticated()) {
   		res.status(401).json({error:'not logged in'});
  	} 
  	if (!req.params.id) {
  		 res.status(400).json({error:'missing params ya dip'});
  		 return;
  	}


  	db.none('delete from surveys where position = $1',[req.params.id])
  		.then(function(data) {
  			res.status(200).json({success:"deleted survey"});
  		}).catch(function(err) {
  			return next(err);
  		});
}

function getallSurveys(req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401).json({error:'not logged in'});
  }
  db.any('select * from surveys order by position')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function newSurvey(req,res,next) {
  if (!req.isAuthenticated()) {
	res.status(401).json({error:'not logged in'});
  }

  //get max position
  db.one('insert into surveys(position) values((select max(position) from surveys)+1) RETURNING *',[parseInt(req.query.lastPos)+1])
  	.then(function (data) {
  		res.status(200).json(data);
  	}).catch(function(err) {
  		return next(err);
  	});
}

function moveSurveyUp(req,res,next) {
	db.none('update surveys set position = -1 where position = $1; update surveys set position = $1 where position = ($1 + 1); update surveys set position = ($1 + 1) where position = -1',[parseInt(req.params.id)])
	.then(function(data) {
		res.status(200).json({success:'moved survey up'});
	}).catch(function(err) {
		return next(err);
	});
}

function moveSurveyDown(req,res,next) {
	db.none('update surveys set position = -1 where position = $1; update surveys set position = $1 where position = ($1 - 1); update surveys set position = ($1 - 1) where position = -1',[parseInt(req.params.id)])
	.then(function(data) {
		res.status(200).json({success:'moved survey down'});
	}).catch(function(err) {
		return next(err);
	});
}

function updateSurvey(req,res,next) {
	if (!req.isAuthenticated()) {
		res.status(401).json({error:'not logged in'});
  	}

  	var days = req.body.daysTill;
  	if (days.length <= 0) {
  		days = null
  	}

	db.none('update surveys set qualtrics_id = $1, days_till_next = $2 where position = $3',[req.body.qualtrics_id,days,req.body.position])
	.then(function(data) {
		res.status(200).json({success:'Updated survey'});
	}).catch(function(err) {
		return next(err);
	});
}

function completeSurvey(req,res,next){
	if (!req.isAuthenticated()) {
   		res.status(401).json({error:'not logged in'});
   		return;
  	}
  	//need to get user's next survey, get it's next, get user and calculate date, update date it's next survey ID
  	db.one('select * from surveys where position = $1',parseInt(req.user.next_survey_position))
	    .then(function (survey) {
	    	if(survey.days_till_next) {
		    	var nextSurveyPosition = survey.position + 1
		    	var nextDate = new Date(req.user.next_survey_date);
	    		nextDate.setDate(nextDate.getDate() + survey.days_till_next);

	    		//check real quick to make sure they aren't trying to cheat now...
	    		var now = new Date();
	    		if (now < req.user.next_survey_date) {
	    			res.status(428).json({error:'no cheating now...'});
	    			return;
	    		} 

	    		//ok were good...update the user with the next due dates etc
	    		db.none('update users set next_survey_date=$1, next_survey_position=$2 where id=$3',
			    [nextDate,nextSurveyPosition,req.user.id]).then(function () {
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
	    		//no more surveys left...remove stuff from the user so that it wont show the button anymore
	    		db.none('update users set next_survey_date=$1, next_survey_position=$2 where id=$3',
			    [null,null,req.user.id]).then(function () {
			      res.status(200)
			        .json({
			          status: 'success',
			          message: "Updated User. No more surveys"
			        });
			    })
			    .catch(function (err) {
			      return next(err);
			    });
	    	}
	   })
	   .catch(function (err) {
	      return next(err);
	});

}

module.exports = router;