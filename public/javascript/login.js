$(function(){
    var $formTip = $("#form-tip");
    // 登录与注册的tap切换
	$(".nav-menu").click(function(event){
        event.preventDefault();
        $("#form-tip").text("");
        $(".nav-menu").removeClass('menu-select');
        $(this).addClass("menu-select");
        $(".nav-cont-item").hide();
        $($(this).attr("href")).show();
    });
    // 登录检查——点击按钮时触发
    $("#login-submit").click(function(event){
        $formTip.text("");
        var name = $("#login-name").val(),
            password = $("#login-password").val();
        if(!!name && !!password){
            $.ajax({
                url: "/user/loginCheck",
                method: "GET",
                dataType: "json",
                data: {
                    name: name,
                    password: password
                },
                success: function(data){
                    if(data.result == "success"){
                        $("#login-form").data("result", true).submit();
                    }else{
                        $("#login-form").data("result", false);
                        $formTip.text("账号或密码错误");
                    }
                },
                error: function(data){
                    $formTip.text("网络异常，检查账号失败");
                }
            });
        }
    });
    // 根据登录检查结果确定是否提交表单
    $("#login-form").submit(function(event){
        console.log($(this).data("result"));
        if(!$(this).data("result")){
            event.preventDefault();
        }
    });
    // 注册表单验证——点击按钮时验证
    $("#register-submit").click(function(event) {
        $formTip.text("");
        var password = $("#register-password").val();
        var passwordAgain = $("#register-password-again").val();
        if(!$("#register-name").data("result") && !!$("#register-name").val()){
            event.preventDefault();
            $formTip.text("账号已存在");
            return;
        }
        if(!$("#register-nickname").data("result") && !!$("#register-nickname").val()){
            event.preventDefault();
            $formTip.text("昵称已存在");
            return;
        }
        if(!!password && !!passwordAgain){
            if(password != passwordAgain){
                $formTip.text("两次密码输入不一致");
                event.preventDefault();
            }
        }
    });

    // 账号输入框失焦后检验账号是否已存在
    $("#register-name").blur(function(){
        var $this = $(this);
        var name = $this.val();
        $.ajax({
            method: "GET",
            url: "/user/checkName",
            data: {name: name},
            dataType: "json",
            success: function(data){
                if(data.result == "success"){
                    $this.data("result", true);
                }else{
                    $this.data("result", false);
                }
            },
            error: function(data){
                $formTip.text("网络异常，检查账号失败");
            }
        });
    });
    // 昵称输入框失焦后检验账号是否已存在
    $("#register-nickname").blur(function(){
        var $this = $(this);
        var nickName = $this.val();
        $.ajax({
            method: "GET",
            url: "/user/checkNickName",
            data: {nickName: nickName},
            dataType: "json",
            success: function(data){
                if(data.result == "success"){
                    $this.data("result", true);
                }else{
                    $this.data("result", false);
                }
            },
            error: function(data){
                $formTip.text("网络异常，检查昵称失败");
            }
        });
    });
});
