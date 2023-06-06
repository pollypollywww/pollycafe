const mongoose = require("mongoose");
const conn = require("./db");

const userSchema = new mongoose.Schema({
    "UserId": Number,
    "Name": String,
    "UserName": String,
    "Passwd": String,
    "Bday": String,
    "Gender": String,
    "Phone": String,
    "Email": String,
    "Level": { type: String, default: "一般會員" },
}, {
    collection: "user",
    versionKey: false,
    timestamps: true,
});

let userModel = conn.model("user", userSchema);

module.exports = userModel;