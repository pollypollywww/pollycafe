const express = require("express");
const router = express.Router();
const model = require("../models");
const loginCheck = require("../utils/loginCheck");
const hbs = require("hbs");

hbs.registerHelper('formatDate', function(date){
    const option = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Taipei"
    };
    return new Date(date).toLocaleString("zh-TW", option);
});

hbs.registerHelper('LocaleString', function(total){
    return total.toLocaleString();
});

hbs.registerHelper('shorten', function(target){
    return target.substring(0, 5);
});

router.use((req, res, next) => {
    req.session.lastPath = "/admin";
    next();
},
    loginCheck.isUserLogined,
    (req, res, next) => {
        if (req.session.userInfo.userLevel !== "管理員") {
            res.send("您無權限拜訪此頁面");
        } else {
            next();
        }
    }
);

router.get("/", (req, res) => {
    let UserName = req.session.userInfo.username;
    res.render("admin/admin_index.html", { UserName });
});

router.get("/item/list", async (req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let result = await model.item.find(
            { "ItemShow": true },
            { "ItemImg": 0, "_id": 0, "createdAt": 0, "updatedAt": 0 });

        //console.log("item/list result", result);
        res.render("admin/item_list.html", { UserName, result });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/item/add", (req, res) => {
    let UserName = req.session.userInfo.username;
    res.render("admin/item_add.html", { UserName });
});

router.post("/item/add", async (req, res) => {
    try {
        let lastItemId = await model.item.findOne({}, { ItemId: 1 }).sort({ ItemId: -1 });
        let ItemId = lastItemId ? lastItemId["ItemId"] + 1 : 1;
        let ItemType = req.body.ItemType;
        let ItemName = req.body.ItemName;
        let ItemPrice = req.body.ItemPrice;
        let ItemSize = req.body.ItemSize;
        let ItemVeg = req.body.ItemVeg;
        let BeanType = req.body.BeanType;
        let ItemNote = req.body.ItemNote;
        let ItemImg = req.body.ItemImg;
        let ItemLaunch = req.body.ItemLaunch;

        let sameNameCheck = await model.item.findOne({ ItemName, ItemShow: true });
        if (sameNameCheck) {
            res.status(400).json({ message: "商品名稱重覆" });
        } else {
            if (ItemType && ItemName && ItemPrice && ItemSize && ItemVeg && ItemNote && ItemImg && ItemLaunch) {
                let result = await model.item.create({
                    ItemId, ItemType, ItemName, ItemPrice, ItemSize, ItemVeg, BeanType, ItemNote, ItemImg, ItemLaunch
                });
                //console.log("item/add result", result);
                res.json({ message: "新增成功" });
            } else {
                res.status(400).json({ message: "內容不可空白" });
            }
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/item/edit/:itemId", async (req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let ItemId = req.params.itemId;
        let result = await model.item.findOne({ ItemId }, { "_id": 0 });
        //console.log("item/edit result", result);

        res.render("admin/item_edit.html", { UserName, result });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.put("/item/edit/:itemId", async (req, res) => {
    try {
        //console.log(req.body);
        let ItemId = req.params.itemId;
        let ItemType = req.body.ItemType;
        let ItemName = req.body.ItemName;
        let ItemPrice = req.body.ItemPrice;
        let ItemSize = req.body.ItemSize;
        let ItemVeg = req.body.ItemVeg;
        let BeanType = req.body.BeanType;
        let ItemNote = req.body.ItemNote;
        let ItemImg = req.body.ItemImg;
        let ItemLaunch = req.body.ItemLaunch;

        if (ItemType && ItemName && ItemPrice && ItemSize && ItemVeg && ItemNote && ItemImg && ItemLaunch) {
            let sameNameCheck = await model.item.find({ ItemName, ItemShow: true, ItemId: { $ne: ItemId } });
            if (sameNameCheck.length > 0) {
              res.status(400).json({ message: "商品名稱重覆" });
            }else{
                let result = await model.item.updateOne(
                    { ItemId }, {
                    "$set": { ItemType, ItemName, ItemPrice, ItemSize, ItemVeg, BeanType, ItemNote, ItemImg, ItemLaunch }
                });
                //console.log("item/edit result", result);
                res.json({ message: "更新成功" });
            }
        } else {
            res.status(400).json({ message: "內容不可空白" });
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.put("/item/edit/delete/:itemId", async (req, res) => {
    try {
        let ItemId = req.params.itemId;
        let result = await model.item.updateOne({ ItemId }, { ItemShow: false, ItemLaunch: false });
        //console.log("item/edit/delete result", result);
        res.json({ message: "刪除成功" });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/mem/list", async (req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let result = await model.user.find({}, { "_id": 0 });
        //console.log("mem/list result", result);

        //會員數量統計
        let countUser = await model.user.countDocuments({});

        res.render("admin/mem_list.html", { UserName, result, countUser });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/mem/orderList/:userId", async(req, res) => {
    try{
        let logUserName = req.session.userInfo.username;
        let UserId = req.params.userId;
        let user = await model.user.findOne({ UserId }, { UserName: 1 });
        let UserName = user.UserName;
        let result = await model.order.find({ UserName }).sort({_id: -1});

        let countOrder = await model.order.countDocuments({ UserName });
        let completeOrder = await model.order.countDocuments({ UserName, PaymentStatus: "已付款", OrderStatus: "已送達" });
        let invalidOrder = await model.order.countDocuments({ UserName, PaymentStatus: "已退款", OrderStatus: "已作廢" });
        let ongoingOrder = countOrder - completeOrder - invalidOrder;

        //console.log(result)
        if(result.length > 0){
            res.render("admin/mem_order_list.html", { logUserName, UserName, result, countOrder, completeOrder, invalidOrder, ongoingOrder });
        }else{
            let message = "該會員目前尚無訂單";
            res.render("admin/mem_order_list.html", { logUserName, UserName, message, countOrder, completeOrder, invalidOrder, ongoingOrder });
        }
            
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
})

router.get("/mem/edit/:userId", async (req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let UserId = req.params.userId;
        let result = await model.user.findOne({ UserId }, { "Passwd": 0, "_id": 0 });
        //console.log("get mem/edit result", result);
        res.render("admin/mem_edit.html", { UserName, result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.put("/mem/edit/:userId", async (req, res) => {
    try {
        let UserId = req.params.userId;
        let Name = req.body.Name;
        let Bday = req.body.Bday;
        let Gender = req.body.Gender;
        let Phone = req.body.Phone;
        let Email = req.body.Email;

        if (Name && Bday && Gender && Phone && Email ) {
            let result = await model.user.updateOne({ UserId }, { "$set": { Name, Bday, Gender, Phone, Email } });
            //console.log("put mem/edit/:userId result", result);
            res.json({ message: "更新成功" });
        } else {
            res.status(400).json({ message: "內容不可空白" });
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/order/list", async(req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let result = await model.order.find({}).sort({_id: -1});

        let countOrder = await model.order.countDocuments({});
        let completeOrder = await model.order.countDocuments({ PaymentStatus: "已付款", OrderStatus: "已送達" });
        let invalidOrder = await model.order.countDocuments({ PaymentStatus: "已退款", OrderStatus: "已作廢" });
        let ongoingOrder = countOrder - completeOrder - invalidOrder;

        res.render("admin/order_list.html", { UserName, result, countOrder, completeOrder, invalidOrder, ongoingOrder });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/order/detail/:orderId", async(req, res) => {
    try{
        let UserName = req.session.userInfo.username;
        let OrderId = req.params.orderId;
        let result = await model.order.findOne({ OrderId });
        res.render("admin/order_detail.html", { UserName, result });    
    } catch(err){
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/order/edit/:orderId", async(req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let OrderId = req.params.orderId;
        let result = await model.order.findOne({ OrderId });
        res.render("admin/order_edit.html", { UserName, result });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.put("/order/edit", async(req, res) =>{
    try {
        let OrderId = req.body.OrderId;
        let PaymentStatus = req.body.PaymentStatus;
        let OrderStatus = req.body.OrderStatus;
        let PayerName = req.body.PayerName;
        let PayerPhoneNum = req.body.PayerPhoneNum;
        let ReciName = req.body.ReciName;
        let ReciPhoneNum = req.body.ReciPhoneNum;
        let City = req.body.City;
        let District = req.body.District;
        let Address = req.body.Address;
        let SellerNote = req.body.SellerNote;
        let Shipping = req.body.Shipping;

        if(PaymentStatus && OrderStatus && PayerName && PayerPhoneNum && ReciName && ReciPhoneNum && (Shipping === "店取" || (City && District && Address))){
            let result = await model.order.updateOne({ OrderId },
                { $set: { PaymentStatus, OrderStatus, PayerName, PayerPhoneNum, ReciName, ReciPhoneNum, City, District, Address, SellerNote }});
                //console.log(result);
            res.json({ message: "更新成功" });
        } else {
            res.status(400).json({ message: "內容不可空白" });
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.put("/order/pushPaymentStatus", async(req, res)=>{
    try{
        let message = req.body.message;
        let OrderId = req.body.OrderId;
        let SellerNote = req.body.SellerNote;
    
        if(message === "已收到款項"){
            let result = await model.order.updateOne({ OrderId },{ $set:{ PaymentStatus: "已付款", SellerNote }})
        }else if(message === "退款申請"){
            let result = await model.order.updateOne({ OrderId },{ $set:{ PaymentStatus: "待退款", SellerNote }})
        }else if(message === "已完成退款"){
            let result = await model.order.updateOne({ OrderId },{ $set:{ PaymentStatus: "已退款", OrderStatus: "已作廢", SellerNote }})
        }
        res.json({message: "更新成功"});
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });  
    }

});

router.get("/statistics", async(req, res) => {
    try{
        //數量及金額統計
        let UserName = req.session.userInfo.username;
        let result_sum = await model.order.aggregate([
            { $match: { PaymentStatus: "已付款", OrderStatus: "已送達" } },
            { $group: {
                    _id: null,
                    sumSubTotal: { $sum: "$Total" },
                    sumQuantity: { $sum: "$Quantity" },
                    sumOrder: { $sum: 1 }
            }}
        ]);
        //console.log(result_sum);

        //銷售品項統計
        let countItem = await model.order.aggregate([
            { $match: { PaymentStatus: '已付款', OrderStatus: '已送達' } },
            { $unwind: '$OrderItem' },
            { $group: {
                  _id: { ItemId: '$OrderItem.ItemId', ItemName: '$OrderItem.ItemName' },
                  count: { $sum: '$OrderItem.ItemQuantity' }
            }},
            { $sort: { count: -1 } }
        ]);
        //console.log(countItem);

        //銷售類別統計
        let countType = await model.order.aggregate([
            { $match: { PaymentStatus: '已付款', OrderStatus: '已送達' } },
            { $unwind: '$OrderItem' },
            { $lookup: {
                from: "item",
                localField: "OrderItem.ItemId",
                foreignField: "ItemId",
                as: "itemData"
            }},
            { $addFields: {
                "OrderItem.ItemType": {$arrayElemAt: ["$itemData.ItemType", 0] }
            }},
            { $group: {
                _id: '$OrderItem.ItemType',
                count: { $sum: '$OrderItem.ItemQuantity'}
            }},
            { $sort: { count: -1 } }
        ]);
        //console.log(countType);

        if(result_sum.length > 0 && countItem.length > 0 && countType.length > 0){
            let sumTotal = result_sum[0].sumSubTotal;
            let sumQuantity = result_sum[0].sumQuantity;
            let sumOrder = result_sum[0].sumOrder;
            res.render("admin/order_statistics.html", { UserName, message: "查詢成功", sumTotal, sumQuantity, sumOrder, countItem, countType });
        }else{
            res.render("admin/order_statistics.html", { UserName, message: "尚無訂單" });
        }

    }catch(err){
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

module.exports = router;