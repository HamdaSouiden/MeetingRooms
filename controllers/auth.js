const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


//Register
exports.registre = async (req, res)=>{
    try{
        const {username, email, password} = req.body;

        //verfier si l'utilisateur déja exist
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        //creation d'un nouveau utilisateur
        const newUser = new User({username, email, password});
        await newUser.save();
        res.status(200).send("User registed successfully");

    }catch(error){
        res.status(400).send(error.message);
    }
};

//Login
exports.login = async (req, res)=>{
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).send("user not found");
        }

        const samePassword = await bcrypt.compare(password, user.password);
        if(!samePassword){
            return res.status(401).send("Invalid Password");
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
        res.send({token:token});
    }catch(error){
        res.status(400).send(error.message);
    }
};