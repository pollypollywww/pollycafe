let cnt = 0;

$(function () {
    axios.get("/cart/load")
        .then(res => {
            let message = res.data.message;
            if (message === "購物車內沒有商品") {
                $("#cartEmpty").text(message);
            } else {
                let userCart = res.data.result[0]; // aggregate後的結果為陣列( User的cart資料位於result包的第1筆陣列中)
                loadItem(userCart);
                loadComplete();
            }
        })
        .catch(err => {
            let message = err.response.data.message;
            alert(message);
        });
});

function loadItem(userCart) {
    let cartItemList = userCart.CartItem;
    //console.log(cartItemList)

    // 設定欄位寬度的 CSS 類別
    const colClasses = ['col-name', 'col-price', 'col-quantity', 'col-total', 'col-edit'];

    // 建立 <colgroup> 元素，設定每個欄位的寬度
    const colgroupHTML = `<colgroup>
                            <col class="${colClasses[0]}">
                            <col class="${colClasses[1]}">
                            <col class="${colClasses[2]}">
                            <col class="${colClasses[3]}">
                            <col class="${colClasses[4]}">
                        </colgroup>`;

    // 將 <colgroup> 元素加入表格
    $("#cartBody").append(colgroupHTML);

    let saveFalseItem = [];
    cartItemList.forEach(item => {
        if (item.ItemLaunch) {
            let true_HTML = `
                <tr>
                    <td data-th="品項" class="${colClasses[0]}">${item.ItemName}<p class="size-text">${item.ItemSize}</p></td>
                    <td data-th="價格" class="${colClasses[1]}">$ ${(item.ItemPrice).toLocaleString()}</td>
                    <td data-th="數量" class="${colClasses[2]}">
                        <button type="button" class="btn btn-sm minusBtn" data-id="${item.ItemId}" data-price="${item.ItemPrice}"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="numInput quantity" min="1" max="999" value="${item.ItemQuantity}" data-id="${item.ItemId}" data-price="${item.ItemPrice}">
                        <button type="button" class="btn btn-sm plusBtn" data-id="${item.ItemId}" data-price="${item.ItemPrice}"><i class="fa-solid fa-plus"></i></button>
                    </td>
                    <td data-th="小計" class="changeTotal ${colClasses[3]} pr-md-4" data-id="${item.ItemId}">$ ${(item.ItemPrice * item.ItemQuantity).toLocaleString()}</td>
                    <td data-th="編輯" class="${colClasses[4]}"><a href="#" class="deleteBtn toThisLink" data-id="${item.ItemId}">刪除</a></td>
                </tr>
            `
            cnt++;
            $("#cartBody_true").append(true_HTML);

        } else if (!item.ItemLaunch) {
            let false_HTML = `
                <tr>
                    <td data-th="品項" class="${colClasses[0]}">${item.ItemName}<p class="size-text">${item.ItemSize}</p></td>
                    <td data-th="價格" class="${colClasses[1]}">$ ${(item.ItemPrice).toLocaleString()}</td>
                    <td data-th="數量" class="${colClasses[2]}">
                        <button type="button" class="btn btn-sm minusBtn" data-id="${item.ItemId}" data-price="${item.ItemPrice}" disabled><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="numInput quantity" min="1" max="999" value="${item.ItemQuantity}" data-id="${item.ItemId}" data-price="${item.ItemPrice}" disabled>
                        <button type="button" class="btn btn-sm plusBtn" data-id="${item.ItemId}" data-price="${item.ItemPrice}" disabled><i class="fa-solid fa-plus"></i></button>
                    </td>
                    <td data-th="小計" class="changeTotal ${colClasses[3]} pr-md-4" data-id="${item.ItemId}">$ ${(item.ItemPrice * item.ItemQuantity).toLocaleString()}</td>
                    <td data-th="編輯" class="${colClasses[4]}"><a href="#" class="deleteBtn toThisLink" data-id="${item.ItemId}">刪除</a></td>
                </tr>
            `
            saveFalseItem.push(false_HTML);
        }
    });
    //console.log(saveFalseItem);
    if (saveFalseItem.length > 0) {
        $(".invalid_block").html(`
            <br><br>
            <p>已失效商品：</p>
            <table class="table table-hover table-rwd invalidItem">
                <thead class="thead-dark">
                    <tr>
                        <th>品項</th>
                        <th class="pl-md-3">價格</th>
                        <th class="pl-md-5">數量</th>
                        <th class="pl-md-4">小計</th>
                        <th class="text-md-center">編輯</th>
                    </tr>
                </thead>
                <tbody id="cartBody_false"></tbody>
            </table>
        `);
        $("#cartBody_false").append(saveFalseItem);
    }
}

function loadComplete() {
    $("#amount-block").html(
        `<p class="text-right">共 <span id="cartCnt">${cnt}</span> 項商品，總數量: <span id="cartQuantity">${sumQuantity()}</span> 件</span></p>
        <p class="text-right">總金額： $ <span class="text-danger" id="cartTotal">${sumTotal().toLocaleString()}</span></p>
        <a href="/members/checkout" class="btn dark-btn float-right" id="checkout">結帳</a>`);

    $("#cartBody_true .quantity").on("change", function () {
        let ItemId = $(this).data("id");
        let price = $(this).data("price");
        let value = $(this).val();
        let total = price * value;
        updateQuantity(ItemId, value, total);
        $("#cartQuantity").text(sumQuantity())
        $("#cartTotal").text(sumTotal().toLocaleString());
    })

    $("#cartBody_true .minusBtn").on("click", function () {
        let ItemId = $(this).data("id");
        let price = $(this).data("price");
        let input = $(`.quantity[data-id="${ItemId}"]`);
        let value = parseInt(input.val());
        if (value > 1) {
            value--;
            input.val(value);
            let total = price * value;
            updateQuantity(ItemId, value, total);
            $("#cartQuantity").text(sumQuantity())
            $("#cartTotal").text(sumTotal().toLocaleString());
        }
    });

    $("#cartBody_true .plusBtn").on("click", function () {
        let ItemId = $(this).data("id");
        let price = $(this).data("price");
        let input = $(`.quantity[data-id=${ItemId}]`);
        let value = parseInt(input.val());
        if (value >= 1) {
            value++;
            input.val(value);
            let total = price * value;
            updateQuantity(ItemId, value, total);
            $("#cartQuantity").text(sumQuantity())
            $("#cartTotal").text(sumTotal().toLocaleString());
        }
    });

    $(".deleteBtn").on("click", function () {
        if (confirm('確認移除該品項 ?')) {
            let ItemId = $(this).data("id");
            axios.delete("/cart/" + ItemId)
                .then(res => {
                    //console.log(res);
                    let message = res.data.message;
                    swal({
                        title: message,
                        icon: "warning",
                    })
                        .then((res) => {
                            location.reload();
                        });
                })
                .catch(err => {
                    let message = err.response.data.message;
                    alert(message);
                })
        }
    });
}

function updateQuantity(ItemId, value, total) {
    $(`#cartBody_true .changeTotal[data-id=${ItemId}]`).text("$" + (total.toLocaleString())); //改變每個商品小計顯示的值
    axios.put("/cart/quantity", { ItemId, value, total })
        .then(res => {
            // let message = res.data.message;
            // console.log(message);
        })
        .catch(err => {
            let message = err.response.data.message;
            console.log(message);
        })
}

function sumTotal() {
    let cartTotal = 0;
    $("#cartBody_true .changeTotal").each(function () {
        let amount = parseInt($(this).text().replace("$", "").replace(",", ""));
        cartTotal += amount;
    });
    return cartTotal;
}

function sumQuantity() {
    let cartQuantity = 0;
    $("#cartBody_true .quantity").each(function () {
        let amount = parseInt($(this).val());
        cartQuantity += amount;
    });
    return cartQuantity;
}