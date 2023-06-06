$(function () {
    axios.get("/members/load-orderlist")
        .then(res => {
            let message = res.data.message;
            if(message === "目前尚無訂單"){
                $("#orderBox").append(message);
            }else{
                let orderData = res.data.result;
                loadOrderList(orderData);
                loadComplete();
            }
        })
        .catch(err => {
            let message = err.response.data.message;
            alert(message);
        });
});

function loadOrderList(orderData) {
    let now = new Date();
    let yyyy = now.getFullYear();
    let MM = now.getMonth() + 1;
    let dd = now.getDate();
    if(MM < 10) MM = "0" + MM;
    if(dd < 10) dd = "0" + dd;
    let today = yyyy + "-" + MM + "-" + dd;

    // var year = now.getFullYear();
    // var month = (now.getMonth() + 1).toString().padStart(2, "0");
    // var day = now.getDate().toString().padStart(2, "0");
    // var today = year + "-" + month + "-" + day;

    // var today = new Date().toISOString().split('T')[0];
    // console.log(now);
    // console.log(today);

    orderData.forEach(order => {
        let OrderItemHTML = "";
        order.OrderItem.forEach(item => {
            OrderItemHTML += `
                <tr>
                    <td>${item.ItemName} (${item.ItemSize})</td>
                    <td>${item.ItemPrice.toLocaleString()}</td>
                    <td>${item.ItemQuantity}</td>
                    <td>${item.ItemTotal.toLocaleString()}</td>
                </tr>
            `;
        });

        let strHTML = `
            <div class="orderRecordBox bg-light p-3 mb-4">
                <table class="table table-rwd text-center">
                    <thead>
                        <tr>
                            <th>訂單編號</th>
                            <th>訂單日期</th>
                            <th>訂單金額</th>
                            <th>付款狀態</th>
                            <th>訂單狀態</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td data-th="訂單編號">${order.OrderId}</td>
                            <td data-th="訂單日期">${formatDate(order.createdAt)}</td>
                            <td data-th="訂單金額">${order.Total.toLocaleString()}</td>
                            <td data-th="訂單狀態">${order.PaymentStatus === "待付款" ? `${order.PaymentStatus} <p class="mb-0"><a href="#" class="toThisLink" data-toggle="modal" data-target="#payModal${order.Id}">我已付款</a></p>` : order.PaymentStatus}</td>
                            <td data-th="訂單狀態">${order.OrderStatus}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="accordion" id="accordion${order.Id}">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between" id="heading${order.Id}">
                            <p class="mb-0" style="text-decoration:none">詳細資訊</p>
                            <i class="fa-solid fa-plus collapsed text-muted" data-toggle="collapse" data-target="#collapse${order.Id}" aria-expanded="false" aria-controls="collapse${order.Id}"></i>
                        </div>
                        <div id="collapse${order.Id}" class="collapse" aria-labelledby="heading${order.Id}" data-parent="#accordion${order.Id}">
                            <div class="card-body">
                                <div class="row mb-4">
                                    <div class="col-md-8">
                                        <table class="table  text-center">
                                            <thead>
                                                <tr>
                                                    <th>品項</th>
                                                    <th>價格</th>
                                                    <th>數量</th>
                                                    <th>總計</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${OrderItemHTML}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="row">
                                            <div class="col text-left pl-md-5">總數量</div>
                                            <div class="col-auto text-right">${order.Quantity}</div>
                                        </div>
                                        <div class="row">
                                            <div class="col text-left pl-md-5">小計</div>
                                            <div class="col-auto text-right">$ ${order.SubTotal.toLocaleString()}</div>
                                        </div>
                                        <div class="row">
                                            <div class="col text-left pl-md-5">運費</div>
                                            <div class="col-auto text-right">$ ${order.ShippingFee}</div>
                                        </div>
                                        <hr>
                                        <div class="row">
                                            <div class="col text-left pl-md-5">總計</div>
                                            <div class="col-auto text-right font-weight-bold text-danger">$ ${order.Total.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="row" style="background-color: #F7F7F7;">
                                    <div class="col p-3">  
                                        <div class="row mb-2">
                                            <div class="font-weight-bold col-md-3">配送方式</div>
                                            <div class="col-md-8">${order.Shipping}</div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="font-weight-bold col-md-3">付款方式</div>
                                            <div class="col-md-8">${order.Payment}</div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="font-weight-bold col-md-3">付款人</div>
                                            <div class="col-md-8">${order.PayerName}</div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="font-weight-bold col-md-3">付款人電話</div>
                                            <div class="col-md-8">${order.PayerPhoneNum}</div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="font-weight-bold col-md-3">${order.TransferInfo ? `匯款資訊` : ''}</div>
                                            <div class="col-md-8">${order.TransferInfo ? order.TransferInfo : ''}</div>
                                        </div> 
                                        <div class="row mb-2">
                                            <div class="font-weight-bold col-md-3">收件人</div>
                                            <div class="col-md-8">${order.ReciName}</div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="font-weight-bold col-md-3">收件電話</div>
                                            <div class="col-md-8">${order.ReciPhoneNum}</div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="font-weight-bold col-md-3">收件地址</div>
                                            <div class="col-md-8">${order.City}${order.District} ${order.Address}</div>
                                        </div>
                                        <div class="row">
                                            <div class="font-weight-bold col-md-3">客人備註</div>
                                            <div class="col-md-8">${order.Note}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="payModal${order.Id}" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title font-weight-bold" id="exampleModalLabel">付款資訊</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        <div class="modal-body">
                            <div class="form-group row">
                                <label for="transferTime${order.OrderId}" class="col-md-3 col-form-label">匯款時間</label>
                                <div class="col-md-9"><input type="date" name="transferTime" id="transferTime${order.OrderId}" class="form-control" max="${today}"></div>
                            </div>
                            <div class="form-group row">
                                <label for="lastFiveNum${order.OrderId}" class="col-md-3 col-form-label">帳號末五碼</label>
                                <div class="col-md-9"><input type="text" name="lastFiveNum" id="lastFiveNum${order.OrderId}" class="form-control numberonly" placeholder="您的匯款帳號末五碼" maxlength="5"></div>
                            </div>
                            <div class="form-group row">
                                <label for="transferAmount${order.OrderId}" class="col-md-3 col-form-label">匯款金額</label>
                                <div class="col-md-9"><input type="text" name="transferAmount" id="transferAmount${order.OrderId}" class="form-control numberonly"></div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <a href="#" data-toggle="modal" data-dismiss="modal" class="btn dark-btn mx-auto payInfo-btn" data-id="${order.OrderId}">送出</a>
                        </div>
                    </div>
                </div>
            </div>
        `
        $("#orderBox").append(strHTML);
    });
}
// 遇到問題:第一筆內容正常，第二筆內容就會出問題(內容都有打卻出現alert("請確認內容是否完整"))，且click後console都是undefined
// 解決方式:渲染區塊id加上${order.OrderId}
        // 原本只有Modal id 跟 payInfo-btn 有綁定動態變數，但input未加上會無法區別value，只能辨別第一筆
        // 原本填寫欄位寫${order.Id}，送出btn卻寫成${order.OrderId}，導致後續錯誤
        // 須注意因為加上動態變數後面，jquery選取時寫法需調整為let transferTime  = $(`[id="transferTime${OrderId}"]`).val();

function loadComplete() {
    $(".numberonly").on("input", function () {
        let inputValue = $(this).val().replace(/[^\d]/g, '');
        $(this).val(inputValue);
    });

    $(".payInfo-btn").on("click", function (e) {
        let OrderId = $(this).data("id");
        let transferTime  = $(`[id="transferTime${OrderId}"]`).val();
        let lastFiveNum  = $(`[id="lastFiveNum${OrderId}"]`).val();
        let transferAmount = $(`[id="transferAmount${OrderId}"]`).val();

        if (!transferTime || lastFiveNum.length < 5 || lastFiveNum === "" || transferAmount === "") {
            alert("請確認內容是否完整");
            e.preventDefault();
            return false;
        } else {
            let TransferInfo = `匯款時間：${transferTime} / 帳號末五碼：${lastFiveNum} / 匯款金額：${transferAmount}`;
            axios.post("/members/transferInfo", { OrderId, TransferInfo })
                .then(res => {
                    let message = res.data.message;
                    alert(message);
                    location.reload();
                })
                .catch(err => {
                    let message = err.response.data.message;
                    alert(message);
                });
        }
    })
}

function formatDate(oldDate) {
    const option = {
        year: "numeric",  //數字形式
        month: "2-digit",  //兩位數形式
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Taipei"
    };
    const newDate = new Date(oldDate).toLocaleString("zh-TW", option);
    return newDate;
}