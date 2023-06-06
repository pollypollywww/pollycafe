const mongoose = require("mongoose");

const connConfig = "mongodb+srv://pollypollywww:LWGOFdpkGvWHptro@polly.09iqrrn.mongodb.net/pollycafeDB";
const conn = mongoose.createConnection(connConfig);

conn.on("connected", () => {
    console.log("MongoDB is connected");
});

module.exports = conn;
