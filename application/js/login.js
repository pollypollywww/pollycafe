$(function(){
    $("#login_btn").on("click", function(){
        let username = $("#username").val();
        let passwd = $("#passwd").val();

        axios.post("/auth", {username, passwd})
        .then(res => {
            // var message = res.data.message;
            // $("#show_msg").text(message);
            if(res.data.redirect) location.href = res.data.redirect;
        })
        .catch(err => {
            var message = err.response.data.message;
            $("#show_msg").text(message);
        })
    });
});