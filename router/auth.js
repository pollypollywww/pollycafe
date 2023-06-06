const express = require("express");
const router = express.Router();
//const storage = require('node-sessionstorage')

const model = require("../models");
const crypto = require("crypto");

router.post("/", 
    // 1. 檢查 username / passwd 是否存在
    (req, res, next) => {
        if(!req.body.username || !req.body.passwd){
            res.status(400).json({message: "缺少帳號或密碼"})
        }else{
            next();
        }
    },
    // 2. 檢查 username / passwd 是否和 server 端一致
    async(req, res, next) => {
        try{
            let Passwd = req.body.passwd;
            let salt = "#polly$3$5";
            Passwd += salt;
            let md5 = crypto.createHash('md5');
            Passwd = md5.update(Passwd).digest('hex');
            
            let data = await model.user.findOne({ UserName : req.body.username, Passwd }, { "Passwd":1, "Level": 1 });
            //console.log(data);
            
            if(!data){
                res.status(400).json({message: "帳號或密碼錯誤"});
            }else{
                req.level = data.Level;
                next();
            }
        }catch(err){
            console.log(err);
            res.status(500).json({message: "server端發生錯誤"});
        }
    },
     // 3. 紀錄資料在 session 上面
    (req, res, next) => {
        req.session.userInfo = {
            username: req.body.username,
            userLevel: req.level,
            isLogined: true
        }
        next();
    },
    // 4. response 回應前端
    (req, res , next) => {
        //console.log("login", req.session);
        // let storagePath = storage.getItem('path');
        let path;
        if(!req.session.lastPath){
            path = "/";
        }else{
            path = req.session.lastPath;
        }
        res.json({
            message: "燈入成功",
            redirect: path,
        });
    },
);

module.exports = router;