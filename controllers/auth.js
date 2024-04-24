const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


//Register
exports.registre = async (req, res)=>{
    try{
        const {username, email, password, phone} = req.body;

        //verfier si l'utilisateur déja exist
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        //creation d'un nouveau utilisateur
        const newUser = new User({username, email, password, phone});
        await newUser.save();

        const token = jwt.sign({_id: newUser._id,isAdmin: newUser.isAdmin}, process.env.JWT_SECRET);
        delete newUser.password;
        res.status(200).send({message:"User registed successfully",token:token,user:newUser});

    }catch(error){
        res.status(400).send(error.message);
    }
};

//Login
exports.login = async (req, res)=>{
    try{
        const email = req.body.email;
        const pass = req.body.password;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).send("user not found");
        }

        const samePassword = await bcrypt.compare(pass, user.password);
        if(!samePassword){
            return res.status(401).send("Invalid Password");
        }

        const token = jwt.sign({_id: user._id,isAdmin: user.isAdmin}, process.env.JWT_SECRET);

        const{password,__v, ...others} = user._doc;
        res.status(200).send({token:token,user:others});
    }catch(error){
        res.status(400).send(error.message);
    }
};