const mongoose = require("mongoose");

const salleReunionSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },

    capacite: {
        type: Number,
        required: true
    },

    disponible: {
        type: Boolean,
        required: true
    }

})


const salleReunion = mongoose.model("reunion", salleReunionSchema);

module.exports = salleReunion;