const salleReunion = require("../models/salleReunion");


//Getting All Meeting Rooms
exports.getAllRooms = async(req, res)=>{
    try{
        const allRooms = await salleReunion.find();
        res.status(200).send(allRooms);
    }catch(error){
        res.status(400).send(error.message);
    }
};