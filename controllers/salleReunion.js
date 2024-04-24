const salleReunion = require("../models/salleReunion");


//Getting All Meeting Rooms
exports.getAllRooms = async(req, res)=>{
    try{
        // Default values for pagination
        const startAt = parseInt(req.query.startAt) || 0;
        const maxResults = parseInt(req.query.maxResults) || 100;

        const allRooms = await salleReunion.find()
            .skip(startAt)
            .limit(maxResults);

        // Optionally, return total count of documents for client-side pagination
        const totalCount = await salleReunion.countDocuments();

        res.status(200).json({
            rooms: allRooms,
            totalCount
        });
    }catch(error){
        res.status(400).send(error.message);
    }
};

//Getting Room By Id
exports.getRoomById = async(req, res)=>{
    try{
        const RoomById = await salleReunion.findById(req.params.id);
        res.status(200).send(RoomById);
    }catch(error){
        res.status(400).send(error.message);
    }
};

//Creation Meeting Rooms
exports.createRoom = async (req, res)=>{
    try{
        const {roomName, capacite} = req.body;
        const newRoom = new salleReunion({nom:roomName, capacite});
        await newRoom.save();

        res.status(201).send("room created successfuly");
    }catch(error){
        res.status(400).send(error.message);
    }
};

//Update Meeting Rooms
exports.updateRoom = async(req, res)=>{
    try{
        const {id} = req.params;
        const {nom, capacite} = req.body;

        const updateRoom = await salleReunion.findByIdAndUpdate(id, {nom, capacite}, {new:true});

        res.send(updateRoom);
    }catch(error){
        res.status(400).send(error.message);
    }
};

//Delete Meeting Rooms
exports.deleteRoom = async (req, res)=>{
    try{
        const {id} = req.params;
        const deleteRoom = await salleReunion.findByIdAndDelete(id);
        if (deleteRoom) {
            res.status(200).json({message:"room deleted", deleteRoom});
        }else{
            res.status(404).json({ message: "room not found" });
        }
    }catch(error){
        res.status(400).send(error.message);
    }
};