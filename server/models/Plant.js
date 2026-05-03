import mongoose from "mongoose";

const plantSchema = new mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        default: 1
    },

    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },

    coverImage: {
        type: String
    },

    images: [
        {
            type: String
        }
    ],

    status: {
        type: String,
        enum: ["available", "assigned", "picked", "planted"],
        default: "available"
    }

}, { timestamps: true });

const plantModel = mongoose.models.Plant || mongoose.model("Plant", plantSchema);

export default plantModel;