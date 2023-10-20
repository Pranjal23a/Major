const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        token: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        number: {
            type: Number,
            required: true
        },
        canvasImage: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);


const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;