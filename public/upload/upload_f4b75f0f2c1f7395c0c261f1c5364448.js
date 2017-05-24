$(function(){
    // 登录与注册的tap切换
	$(".nav-menu").click(function(event){
        event.preventDefault();
        $("#form-tip").text("");
        $(".nav-menu").removeClass('menu-select');
        $(this).addClass("menu-select");
        $(".nav-cont-item").hide();
        $($(this).attr("href")).show();
    });
    // 注册表单验证——点击按钮时验证
    $("#register-submit").click(function(event) {
        var password = $("#register-password").val();
        var passwordAgain = $("#register-password-again").val();
        if(!!password && !!passwordAgain){
            if(password != passwordAgain){
                $("#form-tip").text("两次密码输入不一致");
                event.preventDefault();
            }
            else{
                $("#form-tip").text("");
            }
        }
    });
});
