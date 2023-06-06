const mongoose = require("mongoose");
const conn = require("./db");

const itemSchema = new mongoose.Schema({
    "ItemId": Number,
    "ItemType": String,
    "ItemName": String,
    "ItemPrice": Number,
    "ItemSize": String,
    "ItemVeg": String,
    "BeanType": String,
    "ItemNote": String,
    "ItemLaunch": Boolean,
    "ItemImg": String,
    "ItemShow": {type: Boolean, default: true}
    
},{
    collection: "item",
    versionKey: false,
    timestamps: true,
});

let itemModel = conn.model("item", itemSchema);

module.exports = itemModel;