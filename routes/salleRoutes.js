const express = require("express");
const router = express.Router();
const salleReunion = require("../controllers/salleReunion");

//All Meeting Rooms
router.get("/all", salleReunion.getAllRooms);


module.exports = router;