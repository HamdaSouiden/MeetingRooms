const express = require("express");
const router = express.Router();
const Reservation = require("../controllers/reservation");
const auth = require("../middleware/authentification");

//Get All Reservation
router.get("/", auth, Reservation.getAllReservations);

//Get Reservation 
router.get("/:id", auth,Reservation.getReservationById);

//Create Reservation
router.post("/", auth, Reservation.createReservation);

//Update Reservation
router.put("/:id", auth, Reservation.updateReservation);

//Delete Reservation
router.delete("/:id", auth, Reservation.deleteReservation);

//Confirm Reservation
router.get('/confirm/:token', Reservation.confirmReservation);

module.exports = router;