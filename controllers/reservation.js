const Reservation = require("../models/Reservation");
const MeetingRoom = require("../models/salleReunion");
const jwtUtils = require("../middleware/jwtUtils");
const mailService = require("../service/sendMail");

// Check for overlapping reservations
async function isOverlapping(roomId, start, end, excludeId) {
    const query = {
        meetingRoom: roomId,
        $and: [
            { _id: { $ne: excludeId } }, // Ensure we exclude the current reservation ID if provided
            { $or: [
                { dateStart: { $lte: end }, dateEnd: { $gte: start } }, // Overlaps part of the new reservation
            ]}
        ]
    };
    const overlappingReservation = await Reservation.findOne(query);
    console.log("Overlap check for room", roomId, overlappingReservation ? "found overlap" : "no overlap");
    return !!overlappingReservation;
}

// Validate the reservation times
function validateReservationTimes(start, end) {
    start = new Date(start);
    end = new Date(end);
    const startHour = start.getHours() + (start.getMinutes() / 60);
    const endHour = end.getHours() + (end.getMinutes() / 60);
    const minimumDuration = 1; // Minimum duration in hours

    if (startHour < 8 || endHour > 23 || endHour < startHour) {
        console.error("Invalid time: Reservation must be between 8:00 AM and 11:00 PM and start before it ends.");
        return false;
    }

    const durationHours = (end - start) / (1000 * 60 * 60);
    return durationHours >= minimumDuration;
}

// Get all reservations with optional filtering
exports.getAllReservations = async (req, res) => {
    try {
        const startAt = parseInt(req.query.startAt) || 0;
        const maxResults = parseInt(req.query.maxResults) || 10;
        let query = {};

        if (!req.user.isAdmin) {
            query.reserver = req.user._id;
        }else{
            query.confirmed = { $eq: true };
        }
        if (req.query.roomId) {
            query.meetingRoom = req.query.roomId;
        }
        if (req.query.startDate) {
            query.dateStart = { $gte: new Date(req.query.startDate) };
        }
        if (req.query.endDate) {
            query.dateEnd = { $lte: new Date(req.query.endDate) };
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

        if (!validateReservationTimes(startTime, endTime)) {
            return res.status(400).json({ message: "Invalid reservation times or duration." });
        }

        const room = await MeetingRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Meeting room not found" });
        }

        if (await isOverlapping(roomId, startTime, endTime, null)) {
            return res.status(400).json({ message: "Meeting room is already booked for this time slot" });
        }

        const newReservation = new Reservation({
            reserver: req.user._id,
            meetingRoom: roomId,
            dateStart: startTime,
            dateEnd: endTime,
        });

        await newReservation.save();
        const token = jwtUtils.generateTokenReservation(newReservation);
        const mailOptions = mailService.confirmationReservation(req.user, token);
        await mailService.nodeMailer(mailOptions);

        res.status(201).json({
            message: "Reservation created and confirmation email sent",
            reservation: newReservation,
        });
    } catch (error) {
        console.error("Error creating reservation:", error);
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
    try {
        const { id } = req.params;
        const { dateStart, dateEnd, roomId } = req.body;
        const startTime = new Date(dateStart);
        const endTime = new Date(dateEnd);

        if (!validateReservationTimes(startTime, endTime)) {
            return res.status(400).json({ message: "Invalid reservation times or duration." });
        }

        if (await isOverlapping(roomId, startTime, endTime, id)) {
            return res.status(400).json({ message: "Meeting room is already booked for this time slot." });
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(id, {
            meetingRoom: roomId,
            dateStart: startTime,
            dateEnd: endTime,
        }, { new: true })
            .populate("reserver", "username")
            .populate("meetingRoom");

        if (!updatedReservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        res.status(200).json({
            message: "Reservation updated successfully.",
            reservation: updatedReservation
        });
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

        res.status(200).json({
            message: "Reservation confirmed successfully",
            reservation: updatedReservation
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};