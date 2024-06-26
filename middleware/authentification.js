const jwt = require("jsonwebtoken");

const authentification = (req, res, next)=>{
    const token = req.header("Authorization");
    if(!token || !token.startsWith("Bearer ")){
        return res.status(401).send("Authentification Failed: Invalid Token");
    }

    try{
        const tokenData = token.split(' ')[1];
        const decodeToken = jwt.verify(tokenData, process.env.JWT_SECRET);
        req.user ={
            _id: decodeToken._id, 
            isAdmin: decodeToken.isAdmin
        }
        next();
    }catch(error){
        res.status(400).send(error.message);
    }
}

module.exports = authentification;