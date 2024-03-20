const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
})

UserSchema.pre('save', async function(){
    if(this.isModified("password")) this.password = await bcrypt.hash(this.password, 8);
})

const User =  mongoose.Model("users", UserSchema);

module.exports = User;