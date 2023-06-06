let isUserLogined = (req, res, next) => {
    if(!req.session.userInfo|| req.session.userInfo.isLogined === false){
        res.redirect("/login");
    }else{
        next();
    }
}

let loginedTureOrNot = (req, res, next) => {
    if(!req.session.userInfo || req.session.userInfo.isLogined === false){
        next();
    }else{
        res.redirect("/");
    }
}

module.exports = {
    "isUserLogined" : isUserLogined,
    "loginedTureOrNot" : loginedTureOrNot,
}