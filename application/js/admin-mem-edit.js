$(function(){
    let flag_name = true;
    let flag_bday = true;
    let flag_gender = true;
    let flag_phone = true;
    let flag_email = true;

    let today = new Date().toISOString().split('T')[0];
    $("#bday").prop("max", today);

    $("#update_btn").on("click", function(){
        let Name = $("#name").val();
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

        if(!Bday){
            $("#err_bday").html("請選擇生日");
            flag_bday = false;
        }else{
            $("#err_bday").empty();
            flag_bday = true;
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

        if(flag_name && flag_bday && flag_gender && flag_phone && flag_email){
            axios.put("/admin/mem/edit/" + UserId, { Name, Bday, Gender, Phone, Email })
            .then(res =>{
                let message = res.data.message;
                alert(message);
                if(message === "更新成功") location.href="/admin/mem/list";
            })
            .catch(err =>{
                let message = err.response.data.message;
                alert(message);
            });
        }else{
            alert("欄位錯誤，請注意內容是否完整");
        }
    });
});