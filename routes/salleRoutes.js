const express = require("express");
const router = express.Router();
const salleReunion = require("../controllers/salleReunion");
const auth = require("../middleware/authentification");

//All Meeting Rooms
router.get("/", auth, salleReunion.getAllRooms);

//Meeting Room By Id
router.get("/:id", auth, salleReunion.getRoomById);

//Create Meeting Room
router.post("/", auth, salleReunion.createRoom);

//Update Meeting Room
router.put("/:id", auth, salleReunion.updateRoom);

//Delete Meeting Room
router.delete("/:id", auth, salleReunion.deleteRoom);


module.exports = router;