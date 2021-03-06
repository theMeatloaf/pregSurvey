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
router.get('/api/optOutSelf',optOutSelf);
router.post('/api/addListeningTime',addTime);
router.post('/api/sendInvite',sendInvite);

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

    if (req.body.birth_date) {
      var birthDate = new Date(req.body.birth_date)
      birthDate.setDate(birthDate.getDate() + 1); //dont ask me...i'm drunk and tired
      //need to calculate next survey date...

      //start by getting the first after birth survey
      db.one('select * from surveys where position=1 and beforebirth=false').then(function(survey) {
        //got survey...
        var nextDate = new Date(req.body.birth_date);
        nextDate.setDate(birthDate.getDate() + survey.days_till_next);

        //ok were good...update the user with the next due dates etc
        db.none('update users set phone=$1, notifications_email=$2, notifications_sms=$3, birth_date=$5, next_survey_date = $6, next_survey_position = 1 where id=$4',
        [req.body.phone,req.body.emailNotifications,req.body.smsNotifications,id,birthDate,nextDate]).then(function () {
          res.status(200)
            .json({
              status: 'success',
              message: 'Updated User'
            });
        })
        .catch(function (err) {
          return next(err);
        });
      }).catch(function(err) {
        return next(err);
      });
    } else {
      //no date invovled just update user    
      db.none('update users set phone=$1, notifications_email=$2, notifications_sms=$3, notifications_time=$4 where id=$5',
      [req.body.phone,req.body.emailNotifications,req.body.smsNotifications,req.body.notificationTime,id]).then(function () {
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

}

function addTime(req,res,next) {
    if (!req.isAuthenticated()) {
      res.status(401).json({error:'not logged in'});
      return;
    } 

    if (req.body.seconds == null) {
      res.status(400).json({error:'missing seconds in request'});
      return;
    }

    db.none('update users set seconds_listened = seconds_listened + $1 where id=$2',
        [req.body.seconds,req.user.id]).then(function () {
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
  req.session = null;
  res.status(200)
      .json({
        status: 'success',
        message: 'Logged Out User'
      });
}

function login(req, res, next) {
  req.session = null;

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
            //handle cookie settings
            if (req.body.remember === 'true' ) {
              req.sessionOptions.maxAge = 365 * 24 * 60 * 60 * 1000 ;
            }
            res.status(200).json(user);
        } else {
            req.session = null;
            res.status(401).json({error:"Your user account has been opted out of the study. Contact an Admin to have your account re-enabled at ksanf001@gold.ac.uk"})
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
      res.status(401).json({error:'not authorized to opt out other users'});
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

function optOutSelf(req,res,next) {
    if (!req.isAuthenticated()) {
      res.status(401).json({error:'not logged in'});
      return;
   } 

  db.none('update users set permission_level=$1 where id=$2',
    [-1,req.user.id]).then(function () {
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
      res.status(401).json({error:'not authorized to opt in other users'});
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

  db.many(`select users.*, surveys.days_till_next from users left join surveys on (surveys.position = users.next_survey_position) and surveys.beforebirth = (users.birth_date is null)  where username like $1`,'%'+req.query.email.toLowerCase()+'%')
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
  var phoneNum = req.body.phoneNumber;
  var userName = req.body.username.toLowerCase();

  db.one(`select * from users where id = (select max(id) from users)`).then(function(data) {
    //got the last user lets toggle
    var theyHadMusic = data.music_enabled;
    db.none(`insert into users(username,notifications_email,next_survey_date,next_survey_position,invite_token,phone,music_enabled,notifications_sms)
     values($1,true,$2,1,$3,$4,$5,$6)`,
     [userName,new Date(),hash,phoneNum,!theyHadMusic,(phoneNum.length > 0)]).then(function (user) {
         //this worked...lets email them
         emailInvite(userName,hash,res);
    })
    .catch(function (err) {
        res.status(500).json(err);
    });
  }).catch(function(err) {
    res.status(500).json(err);
  });
}

function sendInvite(req,res,next) {
  if (!req.user || req.user.permission_level != 1) {
      res.status(401).json({error:'not authorized to view this data'});
      return;
  } else if(!req.body.toUser) {
      res.status(401).json({error:'must pass userID'});
  }

  db.one(`select * from users where id = $1`,req.body.toUser).then(function (data) {
        emailInvite(data.username,data.invite_token,res);
    }).catch(function (err) {
      return next(err);
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
      res.status(500).json(err);
    });
}

var emailTemplate_firstHalf = "<html><head><style>img {display:block;margin:auto;}h1 {padding:0;font-family:'Helvetica Neue','Helvetica','Arial',sans-serif;text-align:center;color:rgb(221, 114, 114);font-size:25px;font-weight:300;letter-spacing:0.015em;}p{padding:0;font-family:'Helvetica Neue','Helvetica','Arial',sans-serif;text-align:center;color:#999999;font-size:14px;font-weight:200;letter-spacing:0.015em;}p.footer{font-size:13px;}</style></head><img src='https://maternalmomentsstudy.com/images/logo_circle.png' width=200><h1 style='padding:10px'>Maternal Moments</h1>";
var emailTemplate_secondHalf = "<p class='footer' style='padding:60px 0px 0px 0px;'>Do not reply to this email.</p><p class='footer'>Send any questions/concerns directly to us at ksanf001@gold.ac.uk</p></html>";

function emailForgotPassword(address,token,res) {
  var API_URL = "https://api:"+process.env.MAILGUN_API_KEY+"@api.mailgun.net/v3/" + process.env.MAILGUN_DOMAIN + "/messages";
  
  var inviteUrl =  process.env.BASE_URL+'/forgotPassword?code='+token;

  var message = "<p>It looks like you forgot your password, no problem!</p><p>In order to create a new password, click <a href=\""+inviteUrl+"\">this link</a> or paste this in your browser:<p><p><b>"+inviteUrl+"</b></p>";
  var html = emailTemplate_firstHalf+message+emailTemplate_secondHalf;


  request.post(API_URL,
    { form: { from: 'MaternalMoments@maternalmomentsstudy.com', to: address, subject:'Maternal Moments: Reset Password Request', text:inviteUrl, html:html } },
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
  
  var inviteUrl = process.env.BASE_URL+'/settings?inviteCode='+token;
  var message = "<p>Hello and welcome to Maternal Moments!</p><p>Thank you for your interest in our research and we are so glad you have chosen to take part.</p><p>In order to setup your account, click <a href=\""+inviteUrl+"\">this link</a> or paste this in your browser:<p><p><b>"+inviteUrl+"</b></p><p>Thanks once again and feel free to contact the research team at any point with any questions or concerns. You can email Katie Rose at ksanf001@gold.ac.uk</p><p>Sincerely,<br>Maternal Moments Research Team</p>";
  var html = emailTemplate_firstHalf+message+emailTemplate_secondHalf;

  request.post(API_URL,
    { form: { from: 'MaternalMoments@maternalmomentsstudy.com', to: address, subject:'Welcome to the Maternal Moments study!', text:inviteUrl,html:html  } },
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