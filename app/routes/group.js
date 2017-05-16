var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();

require("../models/group.js");

// 创建群组
router.post("/createGroup", function(req, res){
	mongoose.model("group").find({name: req.body.groupName}, function(err, data){
		if(err)
			console.log(err.message);
		else{
			if(!data.length){
				mongoose.model("group").create({name: req.body.groupName, creater: req.body.creater, member: req.body.creater}, function(err, data){
					if(err)
						console.log(err.message);
					else{
						res.json({result: "success"});
					}
				});
			}
			else{
				res.json({result: "fail", message: "该群组已存在，请重新输入！"});
			}
		}
	});
});

// 搜索群组
router.get("/searchGroup", function(req, res){
	mongoose.model("group").findOne({name: req.query.groupName}, function(err, data){
		if(err)
			console.log(err.message);
		console.log(req.query.groupName, data);
		if(!data)
			res.json({result: "fail", message: "该群组不存在"});
		else
			res.json({result: "success", name: data.name, creater: data.creater, member: data.member});
	});
});

// 加入群组
router.post("/joinGroup", function(req, res){
	console.log(req.body.groupName, req.body.name)
	mongoose.model("group").update({name: req.body.groupName}, {$addToSet: {member: req.body.name}}, function(err, data){
		if(err)
			console.log(err.message);
		else
			res.json({result: "success"});
	});
});

// 获取用户已加入的群组信息
router.get("/getGroupList", function(req, res){
	mongoose.model("group").find({member: req.session.name}, function(err, data){
		if(err)
			console.log(err);
		var result = [];
		data.forEach(function(item){
			result.push(item.name);
		});
		res.json(result);
	});
});

module.exports = router;
