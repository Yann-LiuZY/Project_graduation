var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();

require("../models/message.js");

// 获取私聊消息
router.get("/getPrivateMessageList", function(req, res){
	mongoose.model("message").find({"$or": [{speakerName: req.query.nameOne, listenerName: req.query.nameTwo}, {speakerName: req.query.nameTwo, listenerName: req.query.nameOne}]}).sort({createDate: 1}).exec(function(err, data){
		if(err)
			console.log(err.message);
		else{
			res.json(data);
		}
	});
});
// 获取群聊消息
router.get("/getGroupMessageList", function(req, res){
	mongoose.model("message").find({listenerName: req.query.room}).sort({createDate: 1}).exec(function(err, data){
		if(err)
			console.log(err.message);
		else{
			res.json(data);
		}
	});
});

module.exports = router;
