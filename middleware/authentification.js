const jwt = require("jsonwebtoken");

const authentification = (req, res, next)=>{
    const token = req.header("Authorization");
    if(!token || !token.startWith("Bearer ")){
        return res.status(401).send("Authentification Failed: Invalid Token");
    }

    try{
        const tokenData = token.split(' ')[1];
        const decodeToken = jwt.verify(tokenData, process.env.JWT_SECRET);
        req.userId = decodeToken._id;
        next();
    }catch(error){
        res.status(400).send(error.message);
    }
}

module.exports = authentification;