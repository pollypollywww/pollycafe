function pwd_ResetAuthorized(){
    $("#authorized_btn").on("click", function(){
        $("#show_msg").empty();
        let UserName = $("#username").val();
        let Phone = $("#phone").val();
        if(UserName && Phone){
          axios.post("/forgot/authorized", { UserName, Phone })
            .then(res => {
              if(res.data.url){
                setTimeout(() => {location.href = res.data.url }, 1000)
              }
            })
            .catch(err => {
              let message = err.response.data.message;
              $("#show_msg").html(message);
            });
        }else{
          $("#show_msg").html("內容不可為空");
        }
      });
}

function pwd_Reset(){
    $("#reset_btn").on("click", function(){
        $("#show_msg").empty();
        let UserName = $("#username").val();
        let passwd1 = $("#password1").val();
        let passwd2 = $("#password2").val();

        if(UserName && passwd1 && passwd2){
          if(passwd1.length < 5 || passwd1.length > 15){
            $("#show_msg").html("密碼字數限制 5 ~ 15");
          }else{
            if(passwd1 !== passwd2){
              $("#show_msg").html("密碼不一致");
            }else{
              if(passwd1 === UserName){
                $("#show_msg").html("密碼不可與帳號相符");
              }else{
                axios.put("/forgot/reset", { UserName, passwd1, passwd2 })
                .then(res => {
                  let message = res.data.message;
                  alert(message);
                  setTimeout(()=>{ location.href = "/login" }, 1000);
                })
                .catch(err => {
                  let message = err.response.data.message;
                  setTimeout(()=>{ $("#show_msg").html(message); }, 1000); 
                });
              }
            }    
          }
        }else{
          $("#show_msg").html("內容不可為空");
        }
      });
}

