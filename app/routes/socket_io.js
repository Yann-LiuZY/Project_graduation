/**
 * 基于socket.io的网络即时通讯
 */

var io = require("socket.io")();
var mongoose = require("mongoose");

// 记录在线用户与其相对应的socketid
var userArr = [];

io.on("connection", function(socket){
	// 用户登入，修改登录信息，并给其好友发送广播
	socket.on("init", function(name){
		socket.name = name;
		userArr[name] = socket.id;
		mongoose.model("user").update({name: name}, {$set: {status: "up"}}, function(err, data){
			if(err)
				console.log(err);
		});
		socket.broadcast.emit("announcement", "freshFriendList");
	});
	// 用户退出，修改登录信息，并给其好友发送广播
	socket.on("disconnect", function(){
		delete userArr[socket.name];
		mongoose.model("user").update({name: socket.name}, {$set: {status: "down"}}, function(err, data){
			if(err)
				console.log(err);
		});
		socket.broadcast.emit("announcement", "freshFriendList");
	});

	/**
	 * 实时好友添加
	 * @param  {[string]} from 		好友添加发起方账号
	 * @param  {[string]} to 		好友被添加方账号
	 */
	socket.on("addFriend", function(from, to){
		mongoose.model("user").findOne({name: from}, function(err, data){
			if(err)
				console.log(err);
			else
				io.sockets.sockets[userArr[to]].emit("addFriend", {
					name: from,
					nickName: data.nickName
				});
		});
	});

	/**
	 * 确认实时添加好友
	 * @param  {[string]} from 		好友邀请发起方账号
	 * @param  {[string]} to 		好友被添加方账号
	 */
	socket.on("confirmAddFriend", function(from, to){
		mongoose.model("user").update({name: from}, {$addToSet: {friends: to}}, function(err){
			if(err)
				console.log(err);
		});
		mongoose.model("user").update({name: to}, {$addToSet: {friends: from}}, function(err){
			if(err)
				console.log(err);
		});
		io.sockets.sockets[userArr[from]].emit("announcement", "freshFriendList");
		io.sockets.sockets[userArr[to]].emit("announcement", "freshFriendList");
	});
});

module.exports.listen = function(server){
	io.listen(server);
}
