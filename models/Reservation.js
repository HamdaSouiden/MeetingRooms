const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    dateStart: {
        type: Date,
        required: true
    },

    dateEnd: {
        type: Date,
        required: true
    },

    reserver: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },

    meetingRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"reunion"
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const reservation = mongoose.model("reservation", reservationSchema);

module.exports = reservation;