const mongoose = require("mongoose");
const conn = require("./db");

const cartSchema = new mongoose.Schema({
    "CartId": Number,
    "UserName": String,
    "CartItem": [{
        ItemId: Number,
        ItemName: String,
        ItemPrice: Number,
        ItemQuantity: Number,
        ItemTotal: Number,
        ItemSize: String,
        ItemLaunch: Boolean,
    }],
},{
    collection: "cart",
    versionKey: false,
    timestamps: true,
});

let cartModel = conn.model("cart", cartSchema);

module.exports = cartModel;