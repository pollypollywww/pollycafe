let cnt = 0;
const itemArray = [];

$(function () {
    // 讀取購物車資訊專區
    axios.get("/members/load-checkout")
        .then(res => {
            let cartList = res.data.trueList;
            //console.log(cartList);
            loadItem(cartList);
            closingBlock();
            checkingout();
        })
        .catch(err => {
            let message = err.response.data.message;
            alert(message);
        })
        
    // 付款區塊
    $("input[type='radio'][name='payment']").on("click", function () {
        if ($(this).val() === "信用卡") {
            $("#creditCardGroup").html(`
                <div class="form-group row">
                    <label for="cc-holder" class="col-3 col-form-label">持卡人</label>
                    <div class="col-9 d-flex">
                        <input type="text" name="cc-holder" id="cc-holder" class="form-control letter-space" placeholder="請輸入英文名稱">
                        <div class="pt-1 pl-2 text-danger" id="holderWarning"></div>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="cc-num" class="col-3 col-form-label">信用卡號</label>
                    <div class="col-9 d-flex">
                        <input type="text" name="cc-num" id="cc-num" class="form-control numberonly" maxlength="16">
                        <div class="pt-1 pl-2 text-danger" id="numWarning"></div>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="cc-validdate" class="col-3 col-form-label">有效期限</label>
                    <div class="col-9 d-flex">
                        <input type="text" name="cc-validdate" id="cc-validdate" class="form-control" placeholder="MM/YY" maxlength="5">
                        <div class="pt-1 pl-2 text-danger" id="validdateWarning"></div>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="cc-lastThree" class="col-3 col-form-label">背面末三碼</label>
                    <div class="col-9 d-flex">
                        <input type="text" name="cc-lastThree" id="cc-lastThree" class="form-control numberonly" maxlength="3">
                        <div class="pt-1 pl-2 text-danger" id="lastThreeWarning"></div>
                    </div>
                </div>
            `);
        } else {
            $("#creditCardGroup").empty();
        }

        // 只能輸入英文及空格 >> 持卡人
        $(".letter-space").on("input", function () {
            let inputValue = $(this).val().replace(/[^\a-\z\A-\Z\ ]/g, '').toUpperCase();
            $(this).val(inputValue);
        });

        // 只能輸入數字 >> 卡號, 末三碼
        $(".numberonly").on("input", function () {
            let inputValue = $(this).val().replace(/[^\d]/g, '');
            $(this).val(inputValue);
        });

        // 只能輸入數字，並加上斜線 >> 期限
        $("#cc-validdate").on("input", function () {
            let inputValue = $(this).val().replace(/[^\d]/g, '');  //只能使用數字
            let addSlashValue = inputValue.replace(/^(.{2})(.*)$/, '$1/$2'); //在第2個字後插入斜線
            $(this).val(addSlashValue);
        });
    });

    // 收件資訊城市區域匯入
    city.forEach(item => {
        let cityName = item.CityName;
        $("#city").append(`<option value="${cityName}">${cityName}</option>`);
    });

    $("#city").on("change", function () {
        $("#district").empty();
        $("#district").append(`<option selected disabled>區域</option>`);

        let selectedCity = city.find(eachCity => eachCity.CityName === $("#city").val());
        let allArea = selectedCity.AreaList;

        allArea.forEach(area => {
            let areaName = area.AreaName;
            $("#district").append(`<option value="${areaName}">${areaName}</option>`);
        });
    });

    // 客人備註區塊字數限制
    $("#note").on("input", function () {
        let currentLength = $(this).val().length;
        if (currentLength > 100) {
            $(this).val($(this).val().substring(0, 100));
        }
    });
});

function loadItem(cartList) {
    cartList.forEach(item => {
        let strHTML = `
            <tr>
                <td data-th="名稱">${item.ItemName}<p class="size-text">${item.ItemSize}</p></td>
                <td data-th="價格">$ ${(item.ItemPrice).toLocaleString()}</td>
                <td data-th="數量" class="quantity">${item.ItemQuantity}</td>
                <td data-th="小計" class="total">$ ${(item.ItemTotal).toLocaleString()}</td>
            </tr>`
        cnt++;
        $("#cartBody").append(strHTML);

        itemArray.push({
            ItemId: item.ItemId,
            ItemName: item.ItemName,
            ItemPrice: item.ItemPrice,
            ItemQuantity: item.ItemQuantity,
            ItemTotal: item.ItemTotal,
            ItemSize: item.ItemSize,
        });
    });
}

function closingBlock() {
    $("#cartCnt").text(cnt);

    let sumQuantity = () => {
        let cartQuantity = 0;
        $(".quantity").each(function () {
            let amount = parseInt($(this).text());
            cartQuantity += amount;
        });
        return cartQuantity;
    }
    $("#cartQuantity").text(sumQuantity());

    let sumTotal = () => {
        let cartTotal = 0;
        $(".total").each(function () {
            let amount = parseInt($(this).text().replace("$", "").replace(",", ""));
            cartTotal += amount;
        });
        return cartTotal;
    }
    $("#subtotal").text("$ " + sumTotal().toLocaleString());

    // 運送區塊
    $("input[type='radio'][name='shippingType']").on("click", function () {
        if ($(this).val() === "宅配") {
            $("#city").prop("disabled", false);
            $("#district").prop("disabled", false);
            $("#address").prop("disabled", false);
            $("#shippingMsg").text("宅配運費: 160元");
            $("#shipping").text("$ 160");
            let countTotal = parseInt($("#subtotal").text().replace("$", "").replace(",", "")) + parseInt($("#shipping").text().replace("$", ""));
            $("#total").text("$ " + countTotal.toLocaleString());
        } else {
            $("#city").prop("disabled", true);
            $("#district").prop("disabled", true);
            $("#address").prop("disabled", true);

            $("#shippingMsg").text("店取免運費");
            $("#shipping").text("$ 0");
            let countTotal = parseInt($("#subtotal").text().replace("$", "").replace(",", "")) + parseInt($("#shipping").text().replace("$", ""));
            $("#total").text("$ " + countTotal.toLocaleString());
        }
    });
}

// Final的結帳
function checkingout() {
    let flag_shippingType = false;
    let flag_payment = false;
    let flag_payerName = false;
    let flag_payerPhoneNum = false;
    let flag_reciName = false;
    let flag_reciPhoneNum = false;
    let flag_cityWarning = false;
    let flag_address = false;
    let flag_holder = false;
    let flag_num = false;
    let flag_validdate = false;
    let flag_lastThree = false;

    $("#confirmCheckout").on("click", function () {

        // 填寫欄位之通關區
        if (!$("input[type='radio'][name='shippingType']:checked").val()) {
            flag_shippingType = false;
            $("#shippingWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
        } else {
            flag_shippingType = true;
            $("#shippingWarning").empty();
        }

        if (!$("input[type='radio'][name='payment']:checked").val()) {
            flag_payment = false;
            $("#paymentWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
        } else if ($("input[type='radio'][name='payment']:checked").val() === "ATM轉帳") {
            flag_payment = true;
            flag_holder = true;
            flag_num = true;
            flag_validdate = true;
            flag_lastThree = true;
            $("#paymentWarning").empty();
        } else if ($("input[type='radio'][name='payment']:checked").val() === "信用卡") {
            flag_payment = true;
            $("#paymentWarning").empty();
            if ($("#cc-holder").val().trim() === "") {
                $("#holderWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
                flag_holder = false;
            } else {
                $("#holderWarning").empty();
                flag_holder = true;
            }

            if ($("#cc-num").val().trim() === "" || $("#cc-num").val().length < 14) {
                $("#numWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
                flag_num = false;
            } else {
                $("#numWarning").empty();
                flag_num = true;
            }

            if ($("#cc-validdate").val().trim() === "" || $("#cc-validdate").val().length < 5) {
                $("#validdateWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
                flag_validdate = false;
            } else {
                $("#validdateWarning").empty();
                flag_validdate = true;
            }

            if ($("#cc-lastThree").val().trim() === "" || $("#cc-lastThree").val().length < 3) {
                $("#lastThreeWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
                flag_lastThree = false;
            } else {
                $("#lastThreeWarning").empty();
                flag_lastThree = true;
            }
        }

        if ($("#payerName").val().trim() === "") {
            $("#payerNameWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
            flag_payerName = false;
        } else {
            $("#payerNameWarning").empty();
            flag_payerName = true;
        }

        if ($("#payerPhoneNum").val().trim() === "") {
            $("#payerPhoneNumWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
            flag_payerPhoneNum = false;
        } else {
            $("#payerPhoneNumWarning").empty();
            flag_payerPhoneNum = true;
        }

        if ($("#reciName").val().trim() === "") {
            $("#reciNameWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
            flag_reciName = false;
        } else {
            $("#reciNameWarning").empty();
            flag_reciName = true;
        }

        if ($("#reciPhoneNum").val().trim() === "") {
            $("#reciPhoneNumWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
            flag_reciPhoneNum = false;
        } else {
            $("#reciPhoneNumWarning").empty();
            flag_reciPhoneNum = true;
        }

        if($("input[type='radio'][name='shippingType']:checked").val() === "店取"){
            flag_cityWarning = true;
            flag_address = true;
        }else{
            if (!$("#city").val() || !$("#district").val()) {
                $("#cityWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
                flag_cityWarning = false;
            } else {
                $("#cityWarning").empty();
                flag_cityWarning = true;
            }
    
            if ($("#address").val().trim() === "") {
                $("#addressWarning").html('<i class="fa-solid fa-triangle-exclamation"></i>');
                flag_address = false;
            } else {
                $("#addressWarning").empty();
                flag_address = true;
            }
        }



        // final 按鈕區
        if (flag_shippingType && flag_payment && flag_payerName && flag_payerPhoneNum && flag_reciName && flag_reciPhoneNum && flag_cityWarning && flag_address && flag_holder && flag_num && flag_validdate && flag_lastThree) {
            let Shipping = $("input[type='radio'][name='shippingType']:checked").val();
            let Payment = $("input[type='radio'][name='payment']:checked").val();
            let PayerName = $("#payerName").val();
            let PayerPhoneNum = $("#payerPhoneNum").val();
            let ReciName = $("#reciName").val();
            let ReciPhoneNum = $("#reciPhoneNum").val();
            let City = $("#city").val() || "";
            let District = $("#district").val() || "";
            let Address = $("#address").val() || "";
            let Note = $("#note").val();
            let OrderItem = itemArray;
            let Cnt = cnt;
            let Quantity = parseInt($("#cartQuantity").text());
            let SubTotal = parseInt($("#subtotal").text().replace("$", "").replace(",", ""));
            let ShippingFee = Shipping === "宅配" ? 160 : 0;
            let Total = parseInt($("#total").text().replace("$", "").replace(",", ""));

            if (Payment === "信用卡") {
                let PaymentStatus = "已付款";
                Swal.fire({
                    title: '付款進行中...',
                    timer: 6000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                }).then(() => {
                    setTimeout(() => {
                        axios.post("/members/checkout", { Shipping, Payment, PayerName, PayerPhoneNum, ReciName, ReciPhoneNum, City, District, Address, Note, OrderItem, Cnt, Quantity, SubTotal, ShippingFee, Total, PaymentStatus })
                            .then(res => {
                                let OrderId = res.data.OrderId;
                                location.href = "/members/complete?payment=payment01&orderid=" + OrderId;
                                // location.href = res.data.nextpage;
                            })
                            .catch(err => {
                                alert(err.response.data.message);
                            });
                    }, 1500)
                });
            } else if (Payment === "ATM轉帳") {
                let PaymentStatus = "待付款";
                setTimeout(() => {
                    axios.post("/members/checkout", { Shipping, Payment, PayerName, PayerPhoneNum, ReciName, ReciPhoneNum, City, District, Address, Note, OrderItem, Cnt, Quantity, SubTotal, ShippingFee, Total, PaymentStatus })
                        .then(res => {
                            let OrderId = res.data.OrderId;
                            location.href = "/members/complete?payment=payment02&orderid=" + OrderId;
                        })
                        .catch(err => {
                            alert(err.response.data.message);
                        })
                }, 2000)
            }

        } else {
            alert("內容有誤，請重新確認");
        }
    });
}


