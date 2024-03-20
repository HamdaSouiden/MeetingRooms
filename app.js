const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const app = express();
app.use(express.json());

const MongoDB = process.env.MONGODB_URI;
const Port = process.env.PORT;


mongoose.connect(MongoDB).then(()=>{
    console.log("connected to MongoDB");
    app.listen(Port,()=>{
        console.log(`server listening on port ${Port}`);
    })
}).catch((error)=>{
    console.error("error to connecting to MongoDB", error.message);
})