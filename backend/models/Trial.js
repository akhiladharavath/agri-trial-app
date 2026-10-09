
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: true
        },

        treatmentYield: {
            type: Number,
            default: null
        },

        controlYield: {
            type: Number,
            default: null
        },

        unit: {
            type: String,
            default: null
        },

        normalizedUnit: {
            type: String,
            default: "kg/ha"
        },

        normalizedTreatmentYield: {
            type: Number,
            default: null
        },

        normalizedControlYield: {
            type: Number,
            default: null
        }
    },
    { _id: false }
);

const sourceDetailsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: null
        },

        fileName: {
            type: String,
            default: null
        },

        reference: {
            type: String,
            default: null
        },

        url: {
            type: String,
            default: null
        },

        page: {
            type: String,
            default: null
        }
    },
    { _id: false }
);

const trialSchema = new mongoose.Schema(
    {
        trialId: {
            type: String,
            required: true,
            index: true
        },

        crop: {
            type: String,
            required: true,
            index: true
        },

        product: {
            type: String,
            required: true,
            index: true
        },

        country: {
            type: String,
            required: true,
            index: true
        },

        year: {
            type: Number,
            index: true
        },

        trialType: {
            type: String,
            index: true
        },

        results: [resultSchema],

        // Existing source names remain supported.
        sources: [String],

        // Structured source metadata for evidence traceability.
        sourceDetails: {
            type: [sourceDetailsSchema],
            default: []
        },

        notes: [String]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Trial", trialSchema);