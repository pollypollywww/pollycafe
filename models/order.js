const mongoose = require("mongoose");
const conn = require("./db");

const orderSchema = new mongoose.Schema({
    "Id": Number,
    "OrderId": String,
    "UserName": String,
    "Shipping": String,
    "Payment": String,
    "PayerName": String,
    "PayerPhoneNum": String,
    "ReciName": String,
    "ReciPhoneNum": String,
    "City": String,
    "District": String,
    "Address": String,
    "Note": String,
    "OrderItem": [{
        ItemId: Number,
        ItemName: String,
        ItemPrice: Number,
        ItemQuantity: Number,
        ItemTotal: Number,
        ItemSize: String,
    }],
    "Cnt": Number,
    "Quantity": Number,
    "SubTotal": Number,
    "ShippingFee": Number,
    "Total": Number,
    "PaymentStatus": String,
    "OrderStatus": { type: String, default: "待製作" },
    "TransferInfo": String,
    "SellerNote": String,

}, {
    collection: "order",
    versionKey: false,
    timestamps: true,
});

let orderModel = conn.model("order", orderSchema);

module.exports = orderModel;