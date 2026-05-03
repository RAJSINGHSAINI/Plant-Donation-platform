import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({

    plant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plant",
        required: true
    },

    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String,
        enum: ["available", "assigned", "picked", "planted", "cancelled"],
        default: "available"
    },

    pickedAt: {
        type: Date
    },

    plantedAt: {
        type: Date
    },

    cancelledBy: {
        type: String,
        enum: ["donor", "volunteer", null],
        default: null
    }

}, {
    timestamps: true
});

export default mongoose.model("Donation", donationSchema);