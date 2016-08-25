
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login_after', { title: 'Express' ,username:req.session.user? req.session.user.username:"未登录"});
});

module.exports = router;
