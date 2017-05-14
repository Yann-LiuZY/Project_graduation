/**
 * 页面中部分工具的定义和初始化
 */

$(function(){
	// 模态框点击背景关闭
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
	// 个人信息初始化
	getUserInfo();
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

	// 隐藏菜单栏#dropdown-menu
	var $dropDownMenuBody = $("#dropdown-menu-body");
	$("#dropdown-menu").click(function(){
		$dropDownMenuBody.toggle();
	});
	$("#change-info").click(function(){
		$dropDownMenuBody.hide();
		$("#modal-info-change").show();
	});
	$("#login-out").click(function(){
		location.href = "/loginOut";
	})
});

/**
 * 
 */