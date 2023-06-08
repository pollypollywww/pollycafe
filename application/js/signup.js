let flag_name = false;
let flag_username = false;
let flag_password = false;
let flag_re_password = false;
let flag_bday = false;
let flag_gender = false;
let flag_phone = false;
let flag_email = false;

$(function(){
    let today = new Date().toISOString().split('T')[0];
    $("#bday").prop("max", today);
    
    $("#username").on("change", function(){
        if($(this).val().length > 0){
            if($(this).val().length < 4 || $(this).val().length > 15){
                $("#err_username").html("帳號字數限制 4 ~ 15");
                $("#err_username").css("color", "#d4304c");
            }else{
                axios.post("/usernameCheck", { UserName: $("#username").val() })
                .then(res => {
                    let message = res.data.message;
                    $("#err_username").html(message);
                    $("#err_username").css("color", "#0a8b8f");
                    flag_username = true;
                })
                .catch(err => {
                    let message = err.response.data.message;
                    $("#err_username").html(message);
                    $("#err_username").css("color", "#d4304c");
                });
            }
        }else{
            $("#err_username").empty();
        }
    });

    $("#password").on("change", function(){
        if($(this).val().length > 0){
            if($(this).val().length < 5 || $(this).val().length > 15){
                $("#err_password").html("密碼字數限制 5 ~ 15");
            }else{
                if($(this).val() === $("#username").val()){
                    $("#err_password").html("密碼不可與帳號相符");
                }else{
                    $("#err_password").empty();
                }
            }
        }else{
            $("#err_password").empty();
        }
    });

    $("#re_password").on("change", function(){
        if($(this).val().length > 0){
            if($(this).val() !== $("#password").val()){
                $("#err_re_password").html("密碼與上列不符");
                $("#err_re_password").css("color", "#d4304c");
            }else{
                $("#err_re_password").empty();
            }
        }else{
            $("#err_re_password").empty();
        }
    });

    $("#signup_btn").on("click", function(){
        let Name = $("#name").val();
        let UserName = $("#username").val();
        let Passwd = $("#password").val();
        let rePasswd = $("#re_password").val();
        let Bday = $("#bday").val();
        let Gender = $("input[type='radio'][name='gender']:checked").val();
        let Phone = $("#phone").val();
        let Email = $("#email").val();

        if(Name.trim() === ""){
            $("#err_name").html("請輸入姓名");
            flag_name = false;
        }else{
            $("#err_name").empty();
            flag_name = true;
        }

        if(UserName.trim() === ""){
            $("#err_username").html("請輸入帳號");
            $("#err_username").css("color", "#d4304c");
            flag_username = false;
        }else{
            if(UserName.length < 4 || UserName.length > 15){
                $("#err_username").html("帳號字數限制 4 ~ 15");
                $("#err_username").css("color", "#d4304c");
                flag_username = false;
            }else{
                axios.post("/usernameCheck", { UserName })
                    .then(res => {
                        let message = res.data.message;
                        $("#err_username").html(message);
                        $("#err_username").css("color", "#0a8b8f");
                        flag_username = true;
                    })
                    .catch(err => {
                        let message = err.response.data.message;
                        $("#err_username").html(message);
                        $("#err_username").css("color", "#d4304c");
                        flag_username = false;
                    });
            }
        }

        if(Passwd.trim() === ""){
            $("#err_password").html("請輸入密碼");
            flag_password = false;
        }else{
            if(Passwd.length < 5 || Passwd.length > 15){
                $("#err_password").html("密碼字數限制 5 ~ 15")
                flag_password = false;
            }else{
                if(Passwd === UserName){
                    $("#err_password").html("密碼不可與帳號相符")
                }else{
                    $("#err_password").empty();
                    flag_password = true;
                }
            }
        }

        if(rePasswd.trim() === ""){
            $("#err_re_password").html("請再次輸入密碼");
            flag_re_password = false;
        }else{
            if(rePasswd !== Passwd){
                $("#err_re_password").html("密碼與上列不符")
                flag_re_password = false;
            }else{
                $("#err_re_password").empty();
                flag_re_password = true;
            }
        }

        if(!Bday){
            $("#err_bday").html("請選擇生日");
            flag_bday = false;
        }else{
            let selectedDate = new Date(Bday);
            let now = new Date();
            selectedDate.setHours(0, 0, 0, 0);
            if(selectedDate > now){
                $("#err_bday").html("選擇日期不可大於今日");
                flag_bday = false;
            }else{
                $("#err_bday").empty();
                flag_bday = true;
            }
        }

        if(!Gender){
            $("#err_gender").html("請選擇性別");
            flag_gender = false;
        }else{
            $("#err_gender").empty();
            flag_gender = true;
        }

        if(Phone.trim() === ""){
            $("#err_phone").html("請輸入手機號碼");
            flag_phone = false;
        }else{
            $("#err_phone").empty();
            flag_phone = true;
        }

        if(Email.trim() === ""){
            $("#err_email").html("請輸入電子信箱");
            flag_email = false;
        }else{
            const email = Email.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email === '' || emailRegex.test(email)) {
                $("#err_email").empty();
                flag_email = true;
            } else {
                $("#err_email").html("非有效電子郵件地址格式");
                flag_email = false;
            }
        }

        if(flag_name && flag_username && flag_password && flag_re_password && flag_bday && flag_gender && flag_phone && flag_email){
            axios.post("/signup", {Name, UserName, Passwd, rePasswd, Bday, Gender, Phone, Email})
                .then(res => {
                    let message = res.data.message;
                    alert(message);
                    if (message === "新增成功") location.href = "/";
                })
                .catch(err => {
                    let message = err.response.data.message;
                    alert(message);
                });
        }else{
            alert("欄位錯誤，請注意內容是否完整");
        }
    });
});