const express = require("express");
const router = express.Router();
const loginCheck = require("../utils/loginCheck");
const model = require("../models");
const crypto = require("crypto");

router.get("/edit",
    (req, res, next) => {
        req.session.lastPath = "/members" + req.route.path;
        next();
    },
    loginCheck.isUserLogined,
    async (req, res) => {
        try {
            let UserName = req.session.userInfo.username;
            let result = await model.user.findOne({ UserName },
                { "UserName": 1, "Name": 1, "Bday": 1, "Gender": 1, "Phone": 1, "Email": 1, "_id": 0 }
            );
            //console.log("get edit result", result);
            res.render("members/edit.html", { result });
        } catch(err) {
            console.log(err);
            res.status(500).json({ message: "server端發生錯誤" });
        }
    }
);

router.put("/edit", async (req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let Gender = req.body.Gender;
        let Phone = req.body.Phone;
        let Email = req.body.Email;
        if (Gender && Phone && Email) {
            let result = await model.user.updateOne({ UserName }, { "$set": { Gender, Phone, Email } });
            //console.log("put edit result", result);
            res.json({ message: "更新成功" });
        } else {
            res.status(400).json({ message: "內容不可空白" });
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/edit-pwd",
    (req, res, next) => {
        req.session.lastPath = "/members" + req.route.path;
        next();
    },
    loginCheck.isUserLogined,
    (req, res) => {
        res.render("members/edit-pwd.html");
    }
);

router.put("/edit-pwd",
    async (req, res) => {
        try {
            let UserName = req.session.userInfo.username;
            let oldPasswd = req.body.passwd0;
            let newPasswd = req.body.passwd1;
            let newPasswd2 = req.body.passwd2;

            if(oldPasswd && newPasswd && newPasswd2){
                if(newPasswd !== newPasswd2){
                    res.status(400).json({ message: "密碼與上列不符" });
                }else{
                    let salt = "#polly$3$5";
                    oldPasswd += salt;
                    let md5 = crypto.createHash('md5');
                    oldPasswd = md5.update(oldPasswd).digest('hex');
    
                    let result = await model.user.findOne({ UserName, Passwd: oldPasswd }, { Passwd: 1 });
                    if(!result) {
                        res.status(400).json({ message: "原密碼錯誤" });
                    }else{
                        newPasswd += salt;
                        let new_md5 = crypto.createHash('md5');
                        newPasswd = new_md5.update(newPasswd).digest('hex');
    
                        if(newPasswd === result.Passwd){
                            res.status(400).json({ message: "新密碼不可與舊密碼相同" });
                        }else{
                            let update_result = await model.user.updateOne(
                                { UserName }, { "$set": { Passwd: newPasswd } }
                            )
                            res.json({ message: "更新成功，請重新登入" });
                        }
                    }
                }
            }else{
                res.status(400).json({ message: "內容不可空白" });
            }
        } catch(err) {
            console.log(err);
            res.status(500).json({ message: "server端發生錯誤" });
        }
    }
);

router.get("/checkout",
    loginCheck.isUserLogined,
    (req, res) => {
        res.render("members/checkout.html");
    }
);

router.get("/load-checkout", async (req, res) => {
    try {
        let UserName = req.session.userInfo.username;

        //比對購物車品項ID找出對應價格及是否上架
        let result = await model.cart.aggregate([
            { $match: { UserName } },
            { $unwind: "$CartItem" },
            { $lookup: {
                    from: "item",
                    localField: "CartItem.ItemId",
                    foreignField: "ItemId",
                    as: "itemData"
             }},
            { $addFields: {
                    "CartItem.ItemPrice": { $arrayElemAt: ["$itemData.ItemPrice", 0] },
                    "CartItem.ItemLaunch": { $arrayElemAt: ["$itemData.ItemLaunch", 0] }
            }},
            { $addFields: {
                    "CartItem.ItemTotal": { $multiply: ["$CartItem.ItemPrice", "$CartItem.ItemQuantity"] }, 
                    //避免上一個$addFields中還沒計算出來，故獨立出來避免錯誤或null
            }},
            { $group: {
                    _id: "$_id",
                    UserName: { $first: "$UserName" },
                    CartItem: { $push: "$CartItem" }
             }}
        ]);
        //console.log("result[0]", result[0])
        let temp_result = result[0].CartItem;
        let trueList = temp_result.filter(item => item.ItemLaunch)
        //console.log("trueList", trueList);
        res.json({ message: "載入成功", trueList })
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.post("/checkout", async (req, res) => {
    try {
        let lastId = await model.order.findOne({}, { Id: 1 }).sort({ Id: -1 });
        let Id = lastId ? lastId["Id"] + 1 : 1;

        let year = new Date().getFullYear();
        let month = new Date().getMonth() + 1;
        if (month < 10) month = "0" + month;
        let date = new Date().getDate();
        if (date < 10) date = "0" + date;
        let time = year + month + date;

        let OrderId = time + Id.toString().padStart(4, "0"); // 重覆填補指定字串，以達到指定長度
        let UserName = req.session.userInfo.username;
        let Shipping = req.body.Shipping;
        let Payment = req.body.Payment;
        let PayerName = req.body.PayerName;
        let PayerPhoneNum = req.body.PayerPhoneNum;
        let ReciName = req.body.ReciName;
        let ReciPhoneNum = req.body.ReciPhoneNum;
        let City = req.body.City;
        let District = req.body.District;
        let Address = req.body.Address;
        let Note = req.body.Note;
        let OrderItem = req.body.OrderItem;
        let Cnt = req.body.Cnt;
        let Quantity = req.body.Quantity;
        let SubTotal = req.body.SubTotal;
        let ShippingFee = req.body.ShippingFee;
        let Total = req.body.Total;
        let PaymentStatus = req.body.PaymentStatus;
        let ShippingMethod = req.body.Shipping;

        if(Shipping && Payment && PayerName && PayerPhoneNum && ReciName && ReciPhoneNum && ((ShippingMethod === "店取") || (City && District && Address))){
            let result = await model.order.create({ Id, OrderId, UserName, Shipping, Payment, PayerName, PayerPhoneNum, ReciName, ReciPhoneNum, City, District, Address, Note, OrderItem, Cnt, Quantity, SubTotal, ShippingFee, Total, PaymentStatus })
            if (result) {
                let delete_result = await model.cart.deleteOne({ UserName });
                if (delete_result) {
                    res.json({ message: "ok", OrderId })
                }
            }
        }else{
            res.status(400).json({ message: "內容不可空白" });
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.get("/complete",
    loginCheck.isUserLogined,
    (req, res) => {
        res.render("members/complete.html");
    }
);

router.get("/orderlist",
    (req, res, next) => {
        req.session.lastPath = "/members" + req.route.path;
        next();
    },
    loginCheck.isUserLogined,
    (req, res) => {
        res.render("members/orderlist.html");
    }
);

router.get("/load-orderlist", async (req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let result = await model.order.find({ UserName }).sort({_id: -1});
        if(result.length > 0){
            res.json({ message: "載入成功", result });
        }else{
            res.json({ message: "目前尚無訂單"});
        }
        
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
}
);

router.post("/transferInfo", async (req, res) => {
    try {
        let OrderId = req.body.OrderId;
        let TransferInfo = req.body.TransferInfo;
        if(TransferInfo){
            let result = await model.order.updateOne({ OrderId }, { $set: { TransferInfo, PaymentStatus: "款項確認中" }});
            //console.log(result);
            res.json({message:"送出成功，待款項確認中"});
        }else{
            res.status(400).json({ message: "內容不可空白" });
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

module.exports = router;