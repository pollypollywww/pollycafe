// $("#logout").hide();

$(function(){
    axios.get("/loginStatus")
        .then(res => {
            //console.log(res.data);
            if(res.data.status === "1"){  //尚未登入
                $(".login").html('<a href="/login" class="nav-link" id="login">登入</a>')
                $(".signup").html('<a href="/signup" class="nav-link mr-1" id="signup">註冊</a>')
                // $("#logout").hide();
                // $("#login").show();
                // $("#signup").show();  
            } else if(res.data.status === "2"){  //登入成功
                $(".logout").html('<a href="/logout" class="nav-link mr-1" id="logout">登出</a>')
                // $("#logout").show();
                // $("#login").hide();
                // $("#signup").hide();
            }
        })
        .catch(err => { 
            console.log(err);
            console.log(err.response.data.message);
        });
})