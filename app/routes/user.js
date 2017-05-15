var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
var fs = require("fs");

require("../models/user.js");
// 用户登录
router.post("/login", function(req, res){
	mongoose.model("user").findOne({name: req.body.name}).exec(function(err, data){
		if(err){
			res.status(500).send("用户登录错误");
		}
		else{
			if(!!data && req.body.password === data.password){
				req.session.name = req.body.name;
				res.redirect("/");
			}else{
				res.redirect("/login");
			}
		}
	});
});
// 用户登录检查
router.get("/loginCheck", function(req, res){
	mongoose.model("user").findOne({name: req.query.name}).exec(function(err, data){
		if(err){
			res.status(500).json({message: err.message});
		}
		else{
			if(!data){
				res.json({result: "fail"});
			}
			else{
				if(req.query.password !== data.password)
					res.json({result: "fail"});
				else
					res.json({result: "success"});
			}
		}
	});
});
// 用户注册
router.post("/register", function(req, res){
	mongoose.model("user").find().or([{name: req.body.name}, {nickName: req.body.nickName}]).exec(function(err, data){
		if(err){
			res.status(500).send("用户注册错误");
		}
		else{
			if(!data.length){
				mongoose.model("user").create({
					name: req.body.name,
					nickName: req.body.nickName,
					password: req.body.password
				}, function(err, data){
					if(err){
						console.log(err);
					}
					res.redirect("/login");
				});
			}
			else{
				res.status(400).send("注册信息错误");
			}
		}
	});
});
// 检验账号是否存在
router.get("/checkName", function(req, res){
	mongoose.model("user").find({name: req.query.name}).exec(function(err, data){
		if(err){
			res.status(500).json({message: err.message});
		}
		else{
			if(!data.length){
				res.json({result: "success"});
			}
			else{
				res.json({result: "fail"});
			}
		}
	});
});
// 检验昵称是否存在
router.get("/checkNickName", function(req, res){
	mongoose.model("user").find({nickName: req.query.nickName}).exec(function(err, data){
		if(err){
			res.status(500).json({message: err.message});
		}
		else{
			if(!data.length){
				res.json({result: "success"});
			}
			else{
				res.json({result: "fail"});
			}
		}
	});
});
// 获取用户信息
router.get("/getUserInfo", function(req, res){
	mongoose.model("user").findOne({name: req.session.name}).exec(function(err, data){
		if(err)
			res.status(500).json({message: err.message});
		else
			res.json({data: data});
	});
});
// 修改用户信息
router.post("/changeUserInfo", function(req, res){
	var formidable = require("formidable");
	var form = new formidable.IncomingForm();
	var avatarUrl = "";
	form.encoding = "utf-8";
	form.uploadDir = "public/userImg";
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;
	form.parse(req, function(err, fields, files){
		if(err){
		  console.log(err);
		  res.status(500).json(err);
		}
		var regType = /image\/\w+/;
		var regPath = /\\([^\\]+\.(png|jpg|jpeg))$/;
		if(regType.test(files.avatar.type)){
			avatarUrl = "/userImg/" + regPath.exec(files.avatar.path)[1];
		}
		else{
			fs.unlinkSync(files.avatar.path);
		}
		var changes = {};
		if(!!fields.nickName)
			changes.nickName = fields.nickName;
		if(!!fields.password)
			changes.password = fields.password;
		if(!!fields.email)
			changes.email = fields.email;
		if(!!avatarUrl)
			changes.avatar = avatarUrl;

		mongoose.model("user").update({name: req.session.name}, {$set: changes}, function(err, data){
			if(err){
				console.log(err);
				res.status(500).json(err);
			}
			else{
				res.json({result: "success"});
			}
		});
	});
});

module.exports = router;
