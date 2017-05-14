var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	if(!req.session.name){
		res.redirect("/login");
	}
	else{
		res.render("index");
	}
});
router.get("/login", function(req, res){
	res.render("login");
});
router.get("/loginOut", function(req, res){
	delete req.session.name;
	console.log(req.session);
	res.redirect("/");
});

module.exports = router;
