var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();

router.get("/searchFriend", function(req, res){
	mongoose.model("user").findOne({nickName: req.query.nickName}, function(err, data){
		if(err){
			console.log(err);
			res.status(500).json(err);
		}
		else{
			if(!data)
				res.json({
					result: "fail",
					message: "该用户不存在"
				});
			else if(data.name === req.session.name)
				res.json({
					result: "fail",
					message: "不可添加自己为好友"
				});
			else{
				res.json({
					result: "success",
					name: data.name,
					nickName: data.nickName,
					avatar: data.avatar,
					status: data.status
				});
			}
		}
	});
});

module.exports = router;
