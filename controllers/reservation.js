const Reservation = require("../models/Reservation");
const MeetingRoom = require("../models/salleReunion");
const jwtUtils = require("../middleware/jwtUtils");
const mailService = require("../service/sendMail");
const User = require("../models/User");


async function isOverlapping(roomId, start, end, excludeId) {
    const query = {
        meetingRoom: roomId,
        $or: [
            { dateDebut: { $lte: start }, dateFin: { $gte: start } },
            { dateDebut: { $lte: end }, dateFin: { $gte: end } },
            { dateDebut: { $gte: start }, dateFin: { $lte: end } },
            { dateDebut: { $lte: start }, dateFin: { $gte: end } }
        ]
    };
    console.log("Overlap check query:", query);
    const overlappingReservation = await Reservation.findOne(query);
    if (overlappingReservation) {
        console.log("Overlap found:", overlappingReservation);
    } else {
        console.log("No overlap found.");
    }
    return overlappingReservation;
}

function validateReservationTimes(start, end) {
    const startHour = start.getHours() + (start.getMinutes() / 60);
    const endHour = end.getHours() + (end.getMinutes() / 60);
    const minimumDurationHours = 1;
    const allowedStartHour = 8; // 8:00 AM
    const allowedEndHour = 23; // 11:00 PM

    if (startHour < allowedStartHour || startHour > allowedEndHour || endHour > allowedEndHour) {
        return false;
    }

    return ((end - start) / (1000 * 60 * 60) >= minimumDurationHours);
}

// Get all reservations with optional filtering by meeting room and date range
exports.getAllReservations = async (req, res) => {
    try {
        console.log(req.user);
        let user = await User.findById(req.user._id);
        console.log(user);
        const startAt = parseInt(req.query.startAt) || 0;
        const maxResults = parseInt(req.query.maxResults) || 10;
        let query = { };

        // Optional room ID filter
        if (!req.user.isAdmin) {
            query.reserver = { $eq: req.user._id };
        }
        if (req.query.roomId) {
            query.meetingRoom = req.query.roomId;
        }

        // Optional date range filters
        if (req.query.startDate) {
            query.dateStart.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            query.dateStart.$lte = new Date(req.query.endDate);
        }

        const reservations = await Reservation.find(query)
            .populate("reserver", "username")
            .populate("meetingRoom")
            .skip(startAt)
            .limit(maxResults)
            .exec();

        if (!reservations.length) {
            return res.status(404).json({ message: "No reservations found" });
        }    

        res.status(200).json(reservations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a single reservation by ID
exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate("reserver", "username")
            .populate("meetingRoom")
            .exec();
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        res.status(200).json(reservation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new reservation
exports.createReservation = async (req, res) => {
    try {
        const { dateStart, dateEnd, roomId } = req.body;
        const startTime = new Date(dateStart);
        const endTime = new Date(dateEnd);

        // Time boundaries and duration checks
        if (!validateReservationTimes(startTime, endTime)) {
            return res.status(400).json({ message: "Invalid reservation times or duration." });
        }

        const room = await MeetingRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Meeting room not found" });
        }

        // Check for overlapping reservations
        if (await isOverlapping(roomId, startTime, endTime, null)) {
            return res.status(400).json({ message: "Meeting room is already booked for this time slot" });
        }

        const newReservation = new Reservation({
            reserver: req.user,
            meetingRoom: roomId,
            dateDebut: startTime,
            dateFin: endTime,
        });
        await newReservation.save();

        // Generate token and send confirmation email
        const token = jwtUtils.generateTokenReservation(newReservation);
        const mailOptions = mailService.confirmationReservation(req.user, token);
        await mailService.nodeMailer(mailOptions);

        res.status(201).json({
            message: "Reservation created and confirmation email sent",
            reservation: newReservation,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a reservation
exports.deleteReservation = async (req, res) => {
    try {
        const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!deletedReservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        res.status(200).json({ message: "Reservation deleted", reservation: deletedReservation });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a reservation
exports.updateReservation = async (req, res) => {
    console.log("Update reservation request body:", req.body);
    try {
        const { id } = req.params;
        const { dateStart, dateEnd, roomId } = req.body;

        const startTime = new Date(dateStart);
        const endTime = new Date(dateEnd);

        // Validate reservation times and duration
        if (!validateReservationTimes(startTime, endTime)) {
            return res.status(400).json({ message: "Invalid reservation times or duration." });
        }

        if (await isOverlapping(roomId, startTime, endTime, id)) {
            return res.status(400).json({ message: "Meeting room is already booked for this time slot." });
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(id, {
            meetingRoom: roomId,
            dateDebut: startTime,
            dateFin: endTime,
        }, { new: true }).populate("reserver", "username").populate("meetingRoom");

        if (!updatedReservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        res.status(200).json({ message: "Reservation updated successfully.", reservation: updatedReservation });
    } catch (error) {
        console.error("Update reservation error:", error);
        res.status(400).json({ error: error.message });
    }
};


// Confirm a reservation
exports.confirmReservation = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwtUtils.checkToken(token);
        if (!decoded) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const reservationId = decoded.payload.resid;
        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { $set: { confirmed: true } },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Reservation not found or already confirmed" });
        }

        res.status(200).json({ message: "Reservation confirmed successfully", reservation: updatedReservation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



