const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Routes
const authRoute = require("./routes/authentificate");
const resservationRoute = require("./routes/reservationRoutes");
const roomRoute = require("./routes/salleRoutes");
const userRoute = require("./routes/userRoutes");

app.use("/auth", authRoute);
app.use("/reservation", resservationRoute);
app.use("/room", roomRoute);
app.use("/users", userRoute);

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