let flag_pwd0 = false;
let flag_pwd1 = false;
let flag_pwd2 = false;

$(function(){
    $("#update_btn").on("click",  function(){
        $("#err_pwd0").empty();
        $("#err_pwd1").empty();
        $("#err_pwd2").empty();
        let passwd0 = $("#password0").val();
        let passwd1 = $("#password1").val();
        let passwd2 = $("#password2").val();

        if(passwd0.trim() === ""){
            $("#err_pwd0").html("請輸入舊密碼")
            flag_pwd0 = false;
        }else{
            $("#err_pwd0").empty();
            flag_pwd0 = true;  
        }

        if(passwd1.trim() === ""){
            $("#err_pwd1").html("請輸入新密碼");
            flag_pwd1 = false
        }else{
            if(passwd1.length < 5 || passwd1.length > 15){
                $("#err_pwd1").html("密碼字數限制 5 ~ 15");
                flag_pwd1 = false;
            }else{
                $("#err_pwd1").empty();
                flag_pwd1 = true;
            }
        }

        if(passwd2 !== passwd1){
            $("#err_pwd2").html("密碼與上列不符");
            flag_pwd2 = false;
        }else{
            if(passwd0 === passwd1){
                $("#err_pwd2").html("新密碼不可與舊密碼相同");
                flag_pwd2 = false;
            }else{
                $("#err_pwd2").empty();
                flag_pwd2 = true;
            }
        }
        
        if(flag_pwd0 && flag_pwd1 && flag_pwd2){ 
            axios.put("/members/edit-pwd", { passwd0, passwd1, passwd2 })
                .then(res => {
                    let message = res.data.message;
                    alert(message);
                    if (message === "更新成功，請重新登入") location.href = "/logout";
                })
                .catch(err => {
                    let message = err.response.data.message;
                    if(message === "原密碼錯誤"){
                        $("#err_pwd0").html(message);
                    }else if(message === "密碼與上列不符" || message === "新密碼不可與舊密碼相同"){
                        $("#err_pwd2").html(message);
                    }else{
                        alert(message);
                    }
                });
        }else{
            alert("欄位錯誤，請注意內容是否完整");
        }
    });
});