const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    dateDebut: {
        type: Date,
        required: true
    },

    dateFin: {
        type: Date,
        required: true
    },

    resever: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"users"
    },

    salle: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"reunion"
    }
})

const reservation = mongoose.model("reservation", reservationSchema);

module.exports = reservation;