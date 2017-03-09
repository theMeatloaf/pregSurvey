var express = require('express');
var router = express.Router();

var db = require('../server/queries/queries');

router.post('/api/login',db.login);
router.post('/api/register',db.register);
router.get('/api/puppies', db.getAllPuppies);


module.exports = router;