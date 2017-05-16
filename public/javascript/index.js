/**
 * 页面中部分工具的定义和初始化
 */

// socket.io配置
var socket = io("http://192.168.1.105:3000");
// 当前用户账号
var userName = $("#user-name").data("name");

/**
 * 页面初始化
 */
$(function(){
	// 初始化好友列表
	freshFriendList();
	// 初始化群组列表，并将用户添加至聊天室中
	freshGroupList(function(data){
		if(data.length){
			data.forEach(function(item){
				socket.emit("joinRoom", userName, item);
			});
		}
	});

	// 修改个人登录信息
	socket.emit("init", userName);
	// 服务器公告
	socket.on("announcement", function(event){
		if(event == "freshFriendList"){
			freshFriendList();
		}
		else if(event == "freshGroupList"){
			freshGroupList();
		}
	});
});

/**
 * 部分组件栏的事件
 */
$(function(){
	// 点击背景关闭模态框
	$(".modal-background").click(function(event) {
		$(this).parent().hide();
	});
	// 导航栏按钮效果
	$("#menu-nav-message").click(function(){
		$(".menu-nav-item").removeClass('menu-nav-item-check');
		$(this).addClass("menu-nav-item-check");
		$("#menu-message").show();
		$("#menu-friend").hide();
	});
	$("#menu-nav-friend").click(function(){
		$(".menu-nav-item").removeClass('menu-nav-item-check');
		$(this).addClass("menu-nav-item-check");
		$("#menu-message").hide();
		$("#menu-friend").show();
	});
	// 关闭下拉栏
	$("body").click(function(){
		var $dropdownMenuBody = $("#dropdown-menu-body");
		if($dropdownMenuBody.is(":visible"))
			$dropdownMenuBody.hide();
	});
});



/**
 * 个人信息处理模块
 */

/**
 * 获取当前用户信息，并将其填入html对应位置
 * 无返回值
 */
function getUserInfo(){
	$.ajax({
		url: "/user/getUserInfo",
		method: "get",
		dataType: "json",
		success: function(data){
			// 将信息填入菜单栏
			$("#user-avatar").attr("src", data.data.avatar);
			$("#user-name").text(data.data.nickName);
			// 将信息填入修改个人信息模态框
			$("#info-change-img").attr("src", data.data.avatar);
			$("#info-change-img-input").val("");
			$("#info-change-nickname").val(data.data.nickName);
			$("#info-change-password").val(data.data.password);
			$("#info-change-email").val(data.data.email);
		},
		error: function(error){
			console.log(error);
		}
	});
}
$(function(){
	// 点击图片修改个人头像
	$("#info-change-img").click(function(){
		$("#info-change-img-input").click();
	});
	// 上传图片预览
	$("#info-change-img-input").change(function(event){
		if(this.files.length){
			var file = this.files[0];
			var reader = new FileReader();
			if(!/image\/\w+/.test(file.type)){
				alert("请选择图片作为头像！");
				return false;
			}
			reader.onload = function(event){
				$("#info-change-img").attr("src", event.target.result);
			}
			reader.readAsDataURL(file);
		}
	});
	// 检查昵称是否已存在
	$("#info-change-nickname").blur(function(){
		var $this = $("#info-change-nickname");
        $.ajax({
            method: "GET",
            url: "/user/checkNickName",
            data: {nickName: $this.val()},
            dataType: "json",
            success: function(data){
                if(data.result == "success"){
                    $this.data("result", true);
                }
                else if(data.result == "fail" && userName == data.name){
                    $this.data("result", true);
                }
                else{
                	$this.data("result", false);
                }
            },
            error: function(err){
            	console.log(err);
                alert("网络异常，检查昵称失败");
            }
        });
	});
	// 修改个人信息
	$("#info-change-form").submit(function(event){
		event.preventDefault();
		if(!$("#info-change-nickname").val()){
			alert("请输入昵称");
			return false;
		}
		if(!$("#info-change-password").val()){
			alert("请输入密码");
			return false;
		}
		if(!$("#info-change-nickname").data("result")){
			alert("昵称已存在");
			$("#info-change-nickname").val($("#user-name").text());
			return false;
		}
		var formData = new FormData(this);
		$.ajax({
			url: "/user/changeUserInfo",
			method: "post",
			data: formData,
			dataType: "json",
			processData: false,
			contentType: false,
			success: function(data){
				$("#modal-info-change").hide();
				getUserInfo();
				alert("修改个人信息成功");
			},
			error: function(error){
				console.log(error);
				$("#modal-info-change").hide();
			}
		});
	});

	// 隐藏菜单栏#dropdown-menu开启，及其下属单位点击事件
	$("#dropdown-menu").click(function(event){
		$("#dropdown-menu-body").show();
		event.stopPropagation();
	});
	$("#change-info").click(function(){
		$("#modal-info-change").show();
	});
	$("#login-out").click(function(){
		location.href = "/loginOut";
	})
});



/**
 * 好友管理模块
 */

/**
 * 刷新好友列表
 */
function freshFriendList() {
	$.ajax({
		url: "/friend/getFriends",
		method: "get",
		dataType: "json",
		success: function(data){
			if(!data.length)
				return false;
			else{
				var html = "";
				data.forEach(function(item){
					html += '<li class="menu-item clearfix" data-name=' + item.name + ' data-status=' + item.status +'><img class="menu-item-avatar" src="' + item.avatar + '"><p class="menu-item-name">' + item.nickName + '</p><p class="menu-item-status">' + (item.status == "up" ? "在线" : "离线") + '</p><div class="menu-item-delete" title="删除该好友"></div></li>';
					$("#friend-list").html("").append(html);
				});
			}
		},
		error: function(err){
			console.log(err);
		}
	});
}
$(function(){
	// 点击添加按钮打开搜索模态框
	$("#menu-nav-add").click(function(){
		$("#modal-friend-add").show();
	});
	var $searchInput = $("#search-input");
	// 搜索模态框导航点击事件
	$(".friend-add-btn").click(function(event){
		event.preventDefault();
		$(".friend-add-btn").removeClass("friend-add-btn-check");
		$(this).addClass('friend-add-btn-check');
		$searchInput.data("type", $(this).attr("href"));
	});
	// 添加好友状态下点击#search-btn按钮
	$("#search-btn").click(function(){
		if(!$searchInput.val()){
			alert("请输入查找对象名称");
			return false;
		}
		if($searchInput.data("type") == "friend"){
			$.ajax({
				url: "/friend/searchFriend",
				method: "get",
				dataType: "json",
				data: {
					nickName: $searchInput.val()
				},
				success: function(data){
					if(data.result == "fail"){
						$("#search-result").html("").append('<p class="search-fail">' + data.message + '</p>');
					}
					else{
						$("#search-result").html("").append('<img class="result-avatar" src="' + data.avatar + '"><p class="search-name">' + data.nickName + '</p><p class="search-name">' + (data.status == "up" ? "在线" : "离线") + '</p><a class="btn-search-add" id="btn-search-add" href="javascript:;" title="添加" data-status=' + data.status + ' data-targetname=' + data.name + '></a>');
					}
				},
				error: function(err){
					console.log(err);
					alert("网络错误，请稍候重试")
				}
			});
		}
	});
	// 搜索结果下的添加按钮的点击事件
	$("#search-result").on("click", "#btn-search-add", function(){
		var $this = $(this);
		alert("已向对方发送好友请求，请等待对方接受。");
		$("#modal-friend-add").hide();
		if($this.data("status") == "up"){
			// 若对方在线，即时发送添加好友请求
			socket.emit("addFriend", userName, $this.data("targetname"));
		}
		else{

		}
	});
	/**
	 * 接受实时好友添加
	 * @param  {[Object]} from  	好友添加发起方信息，包含name和nickName
	 */
	socket.on("addFriend", function(from){
		addAnnouncement("好友请求", function(){
			var result = confirm("用户" + from.nickName + "希望添加您为好友，是否同意？");
			if(result){
				socket.emit("confirmAddFriend", from.name, userName);
			}
		});
	});
	// 选中朋友进行聊天
	$("#friend-list").on("click", ".menu-item", function(){
		var $this = $(this);
		if(!normalChatList[$this.data("name")]){
			addNormalChat({
				name: $this.data("name"),
				nickName: $this.find(".menu-item-name").text(),
				avatar: $this.find(".menu-item-avatar").attr("src")
			}, "private");
		}
		normalChatList[$this.data("name")].click();
		$("#menu-nav-message").click();
	});
	// 好友列表下点击.menu-item-delete
	$("#friend-list").on("click", ".menu-item-delete", function(event){
		event.stopPropagation();
		if(confirm("是否确定删除该好友？")){
			var tergetName = $(this).parent().data("name");
			socket.emit("deleteFriend", userName, tergetName);
			alert("已经解除双方好友关系并清除聊天记录");
			if(normalChatList[tergetName]){
				if(normalChatList[tergetName].hasClass('menu-message-check')){
					$("#chat-nickname").text("对方昵称");
					$("#chat-message").html("");
					$("#chat-textarea").data("name", "");
				}
				normalChatList[tergetName].remove();
				delete normalChatList[tergetName];
			}
		}
	});
});



/**
 * 消息模块
 */

/**
 * 菜单列表添加公告消息
 * message为公告的消息内容
 * callback为点击公告后执行的函数
 */
function addAnnouncement(message, callback) {
	var html = '<li class="menu-item clearfix menu-message-check menu-message-new"><img class="menu-item-avatar" src="image/announcement.png"><p class="menu-item-name">' + message + '</p><div class="new-message"></div></li>';
	var item = $(html);
	item.on("click", function(){
		callback();
		$(this).remove();
	});
	$("#menu-message").prepend(item);
}
// 已加入的普通消息数组
var normalChatList = [];
/**
 * 菜单列表添加常用消息，包括群聊和私聊
 * target对象为聊天对象信息
 * targetType为String，分为group群聊和private私聊两种形式
 */
function addNormalChat(target, targetType){
	if(targetType == "private"){
		var html = '<li class="menu-item clearfix menu-message-new"><img class="menu-item-avatar" src="' + target.avatar + '"><p class="menu-item-name">' + target.nickName + '</p><div class="new-message"></div></li>';
		var item = $(html).data("name", target.name).data("nickName", target.nickName).data("avatar", target.avatar);
		item.on("click", function(){
			var $this = $(this);
			$("#menu-message > .menu-item").removeClass('menu-message-check');
			$(this).addClass("menu-message-check").removeClass('menu-message-new');
			$("#chat-nickname").text($this.data("nickName"));
			$("#chat-message").html("");
			$("#chat-textarea").data("name", $this.data("name")).data("nickName", $this.data("nickName")).data("avatar", $this.data("avatar")).data("type", "private");
			// 获取聊天信息并插入展示区域
			$.ajax({
				url: "/message/getPrivateMessageList",
				method: "get",
				data: {
					nameOne: userName,
					nameTwo: $this.data("name")
				},
				dataType: "json",
				success: function(data){
					if(data.length){
						data.forEach(function(item){
							if(item.speakerName == userName)
								addMessage(item.speakerAvatar, item.message, 1);
							else{
								addMessage(item.speakerAvatar, item.message);
							}
						});
					}
				},
				error: function(err){
					console.log(err)
				}
			})
		});
		normalChatList[item.data("name")] = item;
	}
	else if(targetType == "group"){
		var html = '<li class="menu-item clearfix menu-message-new"><i class="group-avatar"></i><p class="menu-item-name">' + decodeURI(target) + '</p><div class="new-message"></div></li>';
		var item = $(html).data("name", target);
		item.on("click", function(){
			var $this = $(this);
			$("#menu-message > .menu-item").removeClass('menu-message-check');
			$(this).addClass("menu-message-check").removeClass('menu-message-new');
			$("#chat-nickname").text(decodeURI($this.data("name")));
			$("#chat-message").html("");
			$("#chat-textarea").data("name", $this.data("name")).data("type", "group");
			// 获取聊天信息并插入展示区域
			$.ajax({
				url: "/message/getGroupMessageList",
				method: "get",
				data: {
					room: $this.data("name")
				},
				dataType: "json",
				success: function(data){
					if(data.length){
						data.forEach(function(item){
							if(item.speakerName == userName)
								addMessage(item.speakerAvatar, item.message, 1);
							else{
								addMessage(item.speakerAvatar, item.message);
							}
						});
					}
				},
				error: function(err){
					console.log(err)
				}
			});
		});
		normalChatList["group" + item.data("name")] = item;
	}
	$("#menu-message").prepend(item);
	
}
/**
 * 添加聊天消息至列表中
 * @param  {[String]} avatar  头像url
 * @param  {[String]} message 消息信息
 * @param  {[String]} type    消息类型：0-对方，1-自己
 */
function addMessage(avatar, message, type){
	var html = '<li class="message-item clearfix"><img class="message-avatar" src="' + avatar +'"><p class="message-text">' + message + '</p></li>';
	var div = $(html);
	if(type){
		div.addClass('message-self');
	}
	$("#chat-message").append(div).scrollTop(99999);
}
$(function(){
	// 在输入框按回车发送消息
	$("#chat-textarea").on("keypress", function(event){
		var $this = $(this);
		if(event.keyCode == 13){
			event.preventDefault();
			var message = $this.val();
			$this.val("");
			if(!$this.data("name")){
				alert("请选择聊天对象");
				return false;
			}
			if(!message){
				return false;
			}
			addMessage($("#user-avatar").attr("src"), message, 1);
			// 私聊处理
			if($this.data("type") == "private"){
				socket.emit("privateMessage", {
					name: userName,
					nickName: $("#user-name").text(),
					avatar: $("#user-avatar").attr("src")
				}, {
					name: $this.data("name"),
					nickName: $this.data("nickName"),
					avatar: $this.data("avatar"),
				}, message);
			}
			// 群聊处理
			else if($this.data("type") == "group"){
				socket.emit("groupMessage", userName, $("#user-name").text(), $("#user-avatar").attr("src"), $this.data("name"), message);
			}
		}
	});
	// 接受他人私聊消息
	socket.on("privateMessage", function(from, message){
		if(normalChatList[from.name]){
			if(normalChatList[from.name].hasClass('menu-message-check'))
				addMessage(from.avatar, message);
			else{
				normalChatList[from.name].addClass('menu-message-new');
			}
		}
		else{
			addNormalChat(from, "private");
		}
	});
	// 接受群聊消息
	socket.on("groupMessage", function(room, avatar, message){
		if(normalChatList["group" + room]){
			if(normalChatList["group" + room].hasClass('menu-message-check'))
				addMessage(avatar, message);
			else{
				normalChatList["group" + room].addClass('menu-message-new');
			}
		}
		else{
			addNormalChat(room, "group");
		}
	});

	// 发送图片
	$("#send-image").click(function(){
		var $chatTextArea = $("#chat-textarea");
		if(!$chatTextArea.data("name")){
			alert("请选择聊天对象");
			return false;
		}
		$("#send-image-input").click();
		$("#send-image-input").on("change", function(){
			if(this.files[0].size > 100 * 1024){
				alert("图片体积过大");
				return false;
			}
			var reader = new FileReader();
			reader.onload = function(event){
				var data = '<img src="' + event.target.result + '">';
				if($chatTextArea.data("type") == "private"){
					socket.emit("privateMessage", {
						name: userName,
						nickName: $("#user-name").text(),
						avatar: $("#user-avatar").attr("src")
					}, {
						name: $chatTextArea.data("name"),
						nickName: $chatTextArea.data("nickName"),
						avatar: $chatTextArea.data("avatar"),
					}, data);
				}
				else if($chatTextArea.data("type") == "group"){
					socket.emit("groupMessage", userName, $("#user-name").text(), $("#user-avatar").attr("src"), $chatTextArea.data("name"), data);
				}
				addMessage($("#user-avatar").attr("src"), data, 1);
			}
			reader.readAsDataURL(this.files[0]);
		});
	});
});



/**
 * 群组模块
 */

/**
 * 刷新群组列表
 * callback   function		刷新列表成功进行的回调
 */
function freshGroupList(callback){
	$.ajax({
		url: "/group/getGroupList",
		method: "get",
		dataType: "json",
		success: function(data){
			if(data.length){
				var html = "";
				data.forEach(function(item){
					html += '<li class="menu-item clearfix" data-name="' + item + '"><i class="group-avatar"></i><p class="menu-item-name">'+ decodeURI(item) +'</p><div class="menu-item-delete" title="退出群组"></div></li>';
				});
				$("#group-list").html("").append(html);
			}
			if(!!callback){
				callback(data);
			}
		},
		error: function(err){
			console.log(err);
		}
	})
}
$(function(){
	// 打开创建群组表单
	$("#group-create").click(function(){
		$("#modal-group-create").show();
	});

	// 创建群组提交按钮事件
	$("#group-create-submit").click(function(){
		var name = $("#group-create-input").val();
		$("#group-create-input").val("");
		$.ajax({
			url: "/group/createGroup",
			method: "post",
			data: {
				creater: userName,
				groupName: encodeURI(name)
			},
			success: function(data){
				if(data.result == "success"){
					alert("创建群组成功，其他成员可通过搜索群组名称加入群组。");
					$("#modal-group-create").hide();
				}
				else if(data.result == "fail")
					alert(data.message);
			},
			error: function(err){
				console.log(err);
			}
		});
	});

	// 添加群组状态下点击#search-btn按钮
	$("#search-btn").click(function(){
		var $searchInput = $("#search-input");
		if(!$searchInput.val()){
			alert("请输入查找对象名称");
			return false;
		}
		if($searchInput.data("type") == "group"){
			$.ajax({
				url: "/group/searchGroup",
				method: "get",
				dataType: "json",
				data: {
					groupName: encodeURI($searchInput.val())
				},
				success: function(data){
					if(data.result == "fail"){
						$("#search-result").html("").append('<p class="search-fail">' + data.message + '</p>');
					}
					else{
						$("#search-result").html("").append('<img class="result-avatar" src="/image/group.png"><p class="search-name">' + decodeURI(data.name) + '</p><a class="btn-search-add" id="btn-search-group" href="javascript:;" title="添加" data-result=' + data.member.indexOf(userName) + ' data-targetname=' + data.name + '></a>');
					}
				},
				error: function(err){
					console.log(err);
					alert("网络错误，请稍候重试")
				}
			});
		}
	});

	// 搜索结果下的添加按钮的点击事件
	$("#search-result").on("click", "#btn-search-group", function(){
		if($(this).data("result") == -1){
			$.ajax({
				url: "/group/joinGroup",
				method: "post",
				data: {
					groupName: $(this).data("targetname"),
					name: userName
				},
				dataType: "json",
				success: function(data){
					if(data.result == "success"){
						alert("加入群组成功");
						freshGroupList();
						$("#modal-friend-add").hide();
						socket.emit("joinRoom", userName, $(this).data("targetname"));
					}
				},
				error: function(err){
					console.log(err);
				}
			});
		}
		else{
			alert("你已加入该群组");
		}
	});

	// 选中群组进行聊天
	$("#group-list").on("click", ".menu-item", function(){
		var $this = $(this);
		if(!normalChatList["group" + $this.data("name")]){
			addNormalChat($this.data("name"), "group");
		}
		normalChatList["group" + $this.data("name")].click();
		$("#menu-nav-message").click();
	});

	// 群组列表下点击.menu-item-delete
	$("#group-list").on("click", ".menu-item-delete", function(event){
		event.stopPropagation();
		if(confirm("是否确定退出该群组？")){
			var tergetName = $(this).parent().data("name");
			socket.emit("deleteGroup", userName, tergetName);
			alert("已经退出该群");
			if(normalChatList["group" + tergetName]){
				if(normalChatList["group" + tergetName].hasClass('menu-message-check')){
					$("#chat-nickname").text("对方昵称");
					$("#chat-message").html("");
					$("#chat-textarea").data("name", "");
				}
				normalChatList["group" + tergetName].remove();
				delete normalChatList["group" + tergetName];
			}
		}
	});
});
