const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, 
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

UserSchema.pre('save', async function(){
    if(this.isModified("password")) this.password = await bcrypt.hash(this.password, 8);
})

const User =  mongoose.model("users", UserSchema);

module.exports = User;