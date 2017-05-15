var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

router.get('/', function(req, res) {
	if(!req.session.name){
		res.redirect("/login");
	}
	else{
		mongoose.model("user").findOne({name: req.session.name}, function(err, data){
			if(err)
				res.status(500).send("获取用户信息失败");
			else{
				res.render("index", {
					name: data.name,
					nickName: data.nickName,
					avatar: data.avatar,
					password: data.password,
					email: data.email,
				});
			}
		});
	}
});
router.get("/login", function(req, res){
	res.render("login");
});
router.get("/loginOut", function(req, res){
	delete req.session.name;
	res.redirect("/");
});

module.exports = router;
