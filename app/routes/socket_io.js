/**
 * 基于socket.io的网络即时通讯
 */

var io = require("socket.io")();
var mongoose = require("mongoose");
var fs = require("fs");

// 记录在线用户与其相对应的socketid
var userArr = [];

// 记录用户与其已加入的聊天室
var userRoom = [];

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
		if(userRoom[socket.name]){
			userRoom[socket.name].forEach(function(item){
				socket.leave(item);
			});
			delete userRoom[socket.name];
		}
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
	/**
	 * 删除好友
	 * @param  {[string]} from 		删除发起人账号
	 * @param  {[string]} to 		被删人账号
	 */
	socket.on("deleteFriend", function(from, to){
		mongoose.model("user").update({name: from}, {$pull: {friends: to}}, function(err){
			if(err)
				console.log(err);
		});
		mongoose.model("user").update({name: to}, {$pull: {friends: from}}, function(err){
			if(err)
				console.log(err);
		});
		mongoose.model("message").remove({"$or": [{speakerName: from, listenerName: to}, {speakerName: to, listenerName: from}]}, function(err){
			if(err)
				console.log(err.message);
		});
		if(userArr[from]){
			io.sockets.sockets[userArr[from]].emit("announcement", "freshFriendList");
		}
		if(userArr[to]){
			io.sockets.sockets[userArr[to]].emit("announcement", "freshFriendList");
		}	
	});
	/**
	 * 用户间私聊
	 * @param  {[Sting]} from          私聊发起者账户名
	 * @param  {[Sting]} to            私聊接受者账户名
	 * @param  {[Sting]} message       私聊消息       
	 */
	socket.on("privateMessage", function(from, to, message){
		mongoose.model("message").create({
			speakerName: from.name,
			speakerNickName: from.nickName,
			speakerAvatar: from.avatar,
			listenerName: to.name,
			listenerNickName: to.nickName,
			listenerAvatar: to.avatar,
			message: message
		}, function(err, data){
			if(err)
				console.log(err.message);
		});
		if(userArr[to.name]){
			io.sockets.sockets[userArr[to.name]].emit("privateMessage", {
				name: from.name,
				nickName: from.nickName,
				avatar: from.avatar
			}, message);
		}
	});
	/**
	 * 好友
	 */



	/**
	 * 用户加入聊天室
	 * @param  {[String]} name  			用户账号
	 * @param  {[String]} room  			聊天室name
	 */
	socket.on("joinRoom", function(name, room){
		if(!userRoom[name]){
			var arr = [];
			arr.push(room);
			userRoom[name] = arr;
		}
		else{
			userRoom[name].push(room);
		}
		socket.join(room);
	});
	/**
	 * 用户群聊
	 * @param  {[String]} name  			说话人账号
	 * @param  {[String]} nickName  		说话人昵称
	 * @param  {[String]} avatar  			说话人头像
	 * @param  {[String]} message  			聊天消息
	 * @param  {[String]} room  			聊天室name
	 */
	socket.on("groupMessage", function(name, nickName, avatar, room, message){
		mongoose.model("message").create({
			speakerName: name,
			speakerNickName: nickName,
			speakerAvatar: avatar,
			listenerName: room,
			listenerNickName: decodeURI(room) + "聊天群组消息",
			listenerAvatar: "无头像",
			message: message
		}, function(err, data){
			if(err)
				console.log(err.message);
		});
		socket.to(room).emit('groupMessage', room, avatar, message);
	});

	/**
	 * 退出群组
	 * @param  {[string]} from 		删除发起人账号
	 * @param  {[string]} room 		群组name
	 */
	socket.on("deleteGroup", function(from, room){
		mongoose.model("group").update({name: room}, {$pull: {member: from}}, function(err){
			if(err)
				console.log(err);
		});
		socket.emit("announcement", "freshGroupList");
		socket.leave(room);
	});
});

module.exports.listen = function(server){
	io.listen(server);
}
