const express = require("express");
const router = express.Router();
const model = require("../models");
const loginCheck = require("../utils/loginCheck");
const LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');

router.get("/",
    (req, res, next) => {
        req.session.lastPath = "/cart";
        next();
    },
    loginCheck.isUserLogined,
    async (req, res) => {
        // 有storageCart
        let storageCart = JSON.parse(localStorage.getItem('storageCart'));
        //console.log("storageCart", storageCart);

        // 登入後，自動加入未登入前的storageCart
        if (storageCart !== null) {
            let UserName = req.session.userInfo.username;
            let findUserCart = await model.cart.findOne({ UserName });

            if (!findUserCart) {
                // 沒有cart -> 新增 cart
                let lastCartId = await model.cart.findOne({}, { CartId: 1 }).sort({ CartId: -1 });
                let newCartId = lastCartId ? lastCartId["CartId"] + 1 : 1

                let CartId = newCartId;
                let CartItem = storageCart;

                let result = await model.cart.create({ CartId, UserName, CartItem });
                if (result) {
                    //console.log("成功: 登入後 >> 沒有 購物車 >> 加入未登入前的 storageCart");
                    localStorage.removeItem('storageCart');
                }
            } else {
                // 有cart -> 更新 cart
                let existingCartItems = findUserCart.CartItem;

                // 檢查 storageCart 中的每一個項目，如果 cart 有 -> 更新 ItemId 的數量，如果 cart 沒有 -> 新增到 cart
                let checkEachItem = storageCart.map(storageItem => {

                    // 尋找 cart 與 storageCart 是否有相同 ItemId 的項目
                    let sameItemId = existingCartItems.find(existingItem => existingItem.ItemId === storageItem.ItemId);
                    if (sameItemId) {
                        //如果cart有相同項目 -> 更新相同項目數量
                        let newQuantity = sameItemId.ItemQuantity + storageItem.ItemQuantity;

                        return {
                            updateOne: {
                                filter: { UserName, "CartItem.ItemId": sameItemId.ItemId },
                                update: { $set: { "CartItem.$.ItemQuantity": newQuantity } }
                            }
                        }
                    } else {
                        //如果cart沒有相同項目 -> 新增到 cart
                        return {
                            updateOne: {
                                filter: { UserName },
                                update: { $push: { CartItem: storageItem } }
                            }
                        }
                    }
                });

                let result = await model.cart.bulkWrite(checkEachItem);
                //console.log(result);
                if (result) {
                    //console.log("成功: 登入後 >> 有 購物車 >> 加入未登入前的 storageCart");
                    localStorage.removeItem('storageCart');
                }
            }
        } else {
            //console.log("未登入前的購物車沒有商品")
        }
        res.render("members/cart.html");
    }
);

let tempCart = [];
router.post("/",
    async (req, res) => {
        try {
            let ItemId = req.body.ItemId;
            let ItemName = req.body.ItemName;
            let ItemQuantity = 1;
            let ItemSize = req.body.ItemSize;

            // 判斷是否登入
            // 1. 沒登入先存 storageCart
            if (!req.session.userInfo || req.session.userInfo.isLogined === false) {

                if (!findItemId(tempCart, ItemId)) {
                    // 如果 tempCart 中沒有重複商品
                    tempCart.push({ ItemId, ItemName, ItemQuantity, ItemSize });
                    //console.log("成功: 沒有登入 >> tempCart 沒有 重複商品");
                    res.json({ message: "加入成功" });
                } else {
                    // 如果 tempCart 中有重複商品
                    findItemId(tempCart, ItemId).ItemQuantity += 1;
                    //console.log("成功: 沒有登入 >> tempCart 有 重複商品");
                    res.json({ message: "加入成功" })
                }
                localStorage.setItem('storageCart', JSON.stringify(tempCart));

            } else {
                // 2. 有登入
                let UserName = req.session.userInfo.username;
                let findUserCart = await model.cart.findOne({ UserName });

                if (!findUserCart) {
                    // 2.2 沒有cart -> 新增 cart
                    let lastCartId = await model.cart.findOne({}, { CartId: 1 }).sort({ CartId: -1 });
                    let newCartId = lastCartId ? lastCartId["CartId"] + 1 : 1

                    let CartId = newCartId;
                    let CartItem = { ItemId, ItemName, ItemQuantity, ItemSize }

                    let result = await model.cart.create({ CartId, UserName, CartItem });
                    if (result) {
                        //console.log("成功: 有登入 >> 沒有 Cart");
                        res.json({ message: "加入成功" })
                    }
                } else {
                    // 2.3 有cart -> 更新 cart
                    let existingCartItems = findUserCart.CartItem;

                    // 檢查現有購物車是否有重複商品
                    let result = findItemId(existingCartItems, ItemId);
                    if (!result) {
                        let CartItem = { ItemId, ItemName, ItemQuantity, ItemSize }
                        let result = await model.cart.updateOne({ UserName }, { $push: { CartItem } });
                        if (result) {
                            //console.log("成功: 有登入 >> 有 Cart >> 無重複商品");
                            res.json({ message: "加入成功" })
                        }
                    } else {
                        let newItemQuantity = result.ItemQuantity += 1;
                        let updateItemQuantity = await model.cart.updateOne(
                            { UserName, "CartItem.ItemId": ItemId },
                            { $set: { "CartItem.$.ItemQuantity": newItemQuantity } }
                        );

                        if (updateItemQuantity) {
                            //console.log("成功: 有登入 >> 有 Cart >> 有重複商品");
                            res.json({ message: "加入成功" })
                        } else {
                            console.log("發生錯誤");
                        }
                    }
                }
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server端發生錯誤" });
        }
    }
);

function findItemId(Arr, ItemId) {
    return Arr.find(item => item.ItemId == ItemId);
}

router.get("/load", async (req, res) => {
    try {
        let UserName = req.session.userInfo.username;
        let findUser = await model.cart.findOne({ UserName });

        if (!findUser) {
            res.json({ message: "購物車內沒有商品" });
        } else {
            let result = await model.cart.aggregate([
                { $match: { UserName } },
                { $unwind: "$CartItem" }, // 拆分資料 -> 將 CartItem 陣列欄位筆筆展開為單獨的資料
                {
                    $lookup: {   // 從其他 collection 拿資料
                        from: "item",
                        localField: "CartItem.ItemId",  // cart
                        foreignField: "ItemId",   // item
                        as: "itemData"  //儲存從 item 中獲取的資料。
                    }
                },
                // $addFields -> 將 itemData.ItemLaunch 的值賦予 CartItem.ItemLaunch 欄位(顯示於輸出結果中，不會直接修改到資料庫的原始數據)
                {
                    $addFields: {
                        "CartItem.ItemPrice": { $arrayElemAt: ["$itemData.ItemPrice", 0] },
                        "CartItem.ItemLaunch": { $arrayElemAt: ["$itemData.ItemLaunch", 0] },
                    }
                },
                {
                    $group: {
                        _id: "$_id",  //a group specification must include an _id
                        UserName: { $first: "$UserName" },
                        CartItem: { $push: "$CartItem" }
                    }
                }
            ]);
            //console.log(JSON.stringify(result, null, 2)); 

            if (result) {
                res.json({ message: "查詢成功", result });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

router.put("/quantity", async (req, res) => {
    try{
        let UserName = req.session.userInfo.username;
        let ItemId = req.body.ItemId;
        let value = req.body.value;
        let ItemTotal = req.body.total;
    
        let result = await model.cart.updateOne(
            { UserName, "CartItem.ItemId": ItemId },
            {
                $set: {
                    "CartItem.$.ItemQuantity": value,
                    "CartItem.$.ItemTotal": ItemTotal
                }
            });
    
        if (result) {
            res.json({ message: "更新成功" })
        } else {
            res.status(500).json({ message: 更新失敗 });
        }
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });    
    }
});

router.delete("/:itemId", async (req, res) => {
    try {
        let ItemId = req.params.itemId;
        let UserName = req.session.userInfo.username;

        let removeItem = await model.cart.updateOne({ UserName }, { $pull: { CartItem: { ItemId } } });
        if (removeItem) {
            //console.log("ItemId:", ItemId + " 刪除成功");
            res.json({ message: "購物車品項已移除" });
        } else {
            console.log("找不到該品項");
            res.status(500).json({ message: "找不到該品項" })
        }

        let result = await model.cart.findOne({ UserName });
        if (result && result.CartItem.length === 0) {
            let deleteCart = await model.cart.deleteOne({ UserName });
            if (deleteCart) {
                console.log("購物車內沒有Item, 移除購物車")
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});


module.exports = router;