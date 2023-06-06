$(function () {
    const urlParams = new URLSearchParams(window.location.search);
    let payment = urlParams.get('payment');
    let orderId = urlParams.get('orderid');

    let year = orderId.substring(0, 4);
    let month = orderId.substring(4, 6);
    let date = orderId.substring(6, 8);
    let time = new Date(year, month - 1, date);
    let plusthree = new Date(time.setDate(time.getDate() + 2));
    let validDate = plusthree.toLocaleDateString();
    //console.log(validDate);

    if (payment === "payment01") {
        // 信用卡
        $("#textbox").html(`
            <h4>付款完成 <i class="fa-solid fa-circle-check text-success"></i> 感謝您的購買</h4>
            <h5>訂單編號：${orderId}</h5>
            <h5>請至 <a class="toThisLink" href="/members/orderlist""><會員專區-訂單紀錄> 追蹤訂單進度</a></h5>
        `);
    } else if (payment === "payment02") {
        //ATM轉帳
        $("#textbox").html(`
            <h4>已收到您的訂單</h4>
            <h5>訂單編號：${orderId}</h5>
            <br>
            <h5>匯款帳號: 國泰世華(013) 123456-654321</h5>
            <h5 class="text-danger">請於 ${validDate} 20:00 前完成付款，經審查後如逾時將取消訂單</h5>
            <h5>完成匯款後請至 <a class="toThisLink" href="/members/orderlist"><會員專區-訂單紀錄></a> 更新匯款資訊(來電或LINE告知亦可)</h5>
        `);
    }
});