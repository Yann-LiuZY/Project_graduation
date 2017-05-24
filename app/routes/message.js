var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var formidable = require("formidable");

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

// 文件上传，返回存储地址
router.post("/fileUpload", function(req, res){
	var form = new formidable.IncomingForm();
	var fileUrl = "";
	form.encoding = "utf-8";
	form.uploadDir = "public/upload";
	form.keepExtensions = true;
	form.maxFieldsSize = 10 * 1024 * 1024;
	form.parse(req, function(err, fields, files){
		if(err){
		  console.log(err);
		  res.status(500).json(err);
		}
		fileUrl = files.upFile.path;
		res.json({"fileUrl": fileUrl});
	});
});

// 语音上传，返回存储地址
router.post("/audioUpload", function(req, res){
	var form = new formidable.IncomingForm();
	var fileUrl = "";
	form.encoding = "utf-8";
	form.uploadDir = "public/voiceMessage";
	form.keepExtensions = true;
	form.maxFieldsSize = 10 * 1024 * 1024;
	form.parse(req, function(err, fields, files){
		if(err){
		  console.log(err);
		  res.status(500).json(err);
		}
		fileUrl = files.audioData.path;
		fs.renameSync(fileUrl, fileUrl + ".wav");
		console.log(fs.statSync(fileUrl + ".wav"));
		var reg = /\\([^\\]+)$/;
		res.json({"audioUrl": "/voiceMessage/" + path.basename(fileUrl) + ".wav"});
	});
});

module.exports = router;
