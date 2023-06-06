const express = require("express");
const app = express();

const path = require("path");
const hbs = require("hbs");
app.engine('html', hbs.__express);
app.set("views", path.join(__dirname, "application", "views"));
app.use(express.static(path.join(__dirname, "application")));

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extend: false,
    limit: "1mb",
    parameterLimit: "1000",
}));

const session = require("express-session");
const model = require("./models");
const crypto = require("crypto");
const LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');

const membersRouter = require("./router/members");
const adminRouter = require("./router/admin");
const authRouter = require("./router/auth");
const cartRouter = require("./router/cart");
const loginCheck = require("./utils/loginCheck");

app.use(session({
    secret: "01yllop#321",
    resave: true,
    saveUninitialized: false,
    name: "polly_id",
    ttl: 24 * 60 * 60 * 1
}));

app.get("/", (req, res) => {
    res.render("index.html");
    //console.log("index", req.session);
});

app.get("/load",
    async (req, res) => {
        try {
            let result = await model.item.find({ ItemLaunch: true });
            //console.log("Index loadItem result", result);
            res.json({ message: "Item ok.", result });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server端發生錯誤" });
        }
    });

app.get("/login",
    loginCheck.loginedTureOrNot,
    (req, res) => {
        res.render("login.html");
    }
);

app.get("/signup",
    loginCheck.loginedTureOrNot,
    (req, res) => {
        res.render("signup.html");
    }
);

app.post("/usernameCheck", async (req, res) => {
    try {
        let UserName = req.body.UserName;
        let findUsername = await model.user.findOne({ UserName });

        if (!findUsername) {
            res.json({ message: "此帳號不存在，可以使用" })
        } else {
            res.status(400).json({ message: "此帳號已存在，不可使用" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server端發生錯誤" });
    }
});

app.post("/signup",
    async (req, res) => {
        try {
            let lastUserId = await model.user.findOne({}, { UserId: 1 }).sort({ UserId: -1 });
            let UserId = lastUserId ? lastUserId["UserId"] + 1 : 1;
            let Name = req.body.Name;
            let UserName = req.body.UserName;
            let Passwd = req.body.Passwd;
            let rePasswd = req.body.rePasswd;
            let Bday = req.body.Bday;
            let Gender = req.body.Gender;
            let Phone = req.body.Phone;
            let Email = req.body.Email;

            if (Name && UserName && Passwd && rePasswd && Bday && Gender && Phone && Email) {
                if(Passwd === rePasswd ){
                    let salt = "#polly$3$5";
                    Passwd += salt;
                    let md5 = crypto.createHash('md5');
                    Passwd = md5.update(Passwd).digest('hex');
                    let result = await model.user.create({ UserId, Name, UserName, Passwd, Bday, Gender, Phone, Email });
                    //console.log("signup result", result);
                    res.json({ message: "新增成功" });
                }else{
                    res.status(400).json({ message: "密碼不一致" });
                }
            } else {
                res.status(400).json({ message: "內容不可空白" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "server端發生錯誤" });
        }
    }
);

app.get("/loginStatus",
    (req, res) => {
        if (!req.session.userInfo || req.session.userInfo.isLogined === false) {
            res.json({ status: "1", message: "尚未登入" });
        } else {
            res.json({ status: "2", message: "登入成功", username: req.session.userInfo.username });
        }
    }
);

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.clearCookie("polly_id");
    res.redirect("/");
    //console.log("logout", req.session);
});

app.get("/forgot/authorized", 
    loginCheck.loginedTureOrNot,
    (req, res) => {
        res.render("resetPwd-authorized.html");
    }
);

app.post("/forgot/authorized", 
    loginCheck.loginedTureOrNot,
    async(req, res) => {
        try{
            let UserName = req.body.UserName;
            let Phone = req.body.Phone;
            if(UserName && Phone){
                let result = await model.user.findOne({ UserName, Phone })
                if(result){
                    res.json({message: "找到相符資料", url: "/forgot/reset"});
                }else{
                    res.status(400).json({message: "找不到相符資料"});
                }
            }else{
                res.status(400).json({ message: "內容不可空白" });
            }
        }catch(err){
            console.log(err);
            res.status(500).json({ message: "server端發生錯誤" });
        }
    }
);

app.get("/forgot/reset", 
    loginCheck.loginedTureOrNot,
    (req, res) => {
        res.render("resetPwd.html");
    }
);

app.put("/forgot/reset",
    loginCheck.loginedTureOrNot,
    async(req, res) => {
        try{
            let UserName = req.body.UserName;
            let Passwd = req.body.passwd1;
            let Passwd2 = req.body.passwd2;

            if(UserName && Passwd && Passwd2){
                if(Passwd !== Passwd2){
                    res.status(400).json({message: "密碼不一致"});
                }else{
                    if(Passwd === UserName){
                        res.status(400).json({message: "密碼不可與帳號相符"});
                    }else{
                        let salt = "#polly$3$5";
                        Passwd += salt;
                        let md5 = crypto.createHash('md5');
                        Passwd = md5.update(Passwd).digest('hex');
                
                        let result = await model.user.findOne({ UserName })
                        if(result){
                            let update = await model.user.updateOne({ UserName }, { $set: { Passwd } });
                            if(update){
                                res.json({message: "修改成功"});
                            }else{
                                res.status(500).json({message: "修改失敗"});
                            }  
                        }else{
                            res.status(400).json({message: "帳號不存在"});
                        }    
                    }
                } 
            }else{
                res.status(400).json({ message: "內容不可空白" });
            }
        }catch(err){
            console.log(err);
            res.status(500).json({ message: "server端發生錯誤" });
        }
    }
);

app.use("/members", membersRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/cart", cartRouter);

const portNum = process.env.PORT || 8088;
app.listen(portNum, () => {
    console.log(`Server is running at localhost:${portNum}`);
});