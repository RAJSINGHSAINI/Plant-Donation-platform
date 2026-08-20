import Donation from "../models/donate.js";
import Plant from "../models/Plant.js";
import userModel from "../models/user.js";

// 1. PICK PLANT 
export const pickPlant = async (req, res) => {
    try {
        const { plantID } = req.body;
        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user || !user.isAccountVerified) {
            return res.json({ success: false, message: "User not verified" });
        }

        const plant = await Plant.findById(plantID);
        if (!plant) {
            return res.json({ success: false, message: "Plant not found" });
        }

        if (plant.owner.toString() === userID) {
            return res.json({ success: false, message: "You cannot pick your own plant" });
        }

        if (plant.status !== "available") {
            return res.json({ success: false, message: "Plant not available" });
        }

        //  Limit check 
        const activePlants = await Donation.countDocuments({
            volunteer: userID,
            status: { $in: ["assigned", "picked"] }
        });

        if (activePlants >= 5) {
            return res.json({ success: false, message: "Limit reached (max 5 plants)" });
        }

        // Create donation entry
        const donation = await Donation.create({
            plant: plantID,
            donor: plant.owner,
            volunteer: userID,
            status: "assigned"
        });

        // Update plant status
        plant.status = "assigned";
        await plant.save();

        res.json({ success: true, message: "Plant assigned successfully", donation });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

 
//  DONOR CONFIRMS PICKUP
export const confirmPickup = async (req, res) => { 
    try {
        const { donationID } = req.body;
        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user || !user.isAccountVerified) {
            return res.json({ success: false, message: "User not verified" });
        }
        const donation = await Donation.findById(donationID);
        if (!donation) {
            return res.json({ success: false, message: "Donation not found" });
        }

        if (donation.donor.toString() !== userID) {
            return res.json({ success: false, message: "Only donor can confirm pickup" });
        }

        donation.status = "picked";
        donation.pickedAt = new Date();
        await donation.save();

        // update plant
        const plant = await Plant.findById(donation.plant);
        plant.status = "picked";
        await plant.save();

        res.json({ success: true, message: "Pickup confirmed" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// VOLUNTEER MARKS PLANTED
export const markPlanted = async (req, res) => {
    try {
        const { donationID } = req.body;
        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user || !user.isAccountVerified) {
            return res.json({ success: false, message: "User not verified" });
        }

        const donation = await Donation.findById(donationID);
        if (!donation) {
            return res.json({ success: false, message: "Donation not found" });
        }

        if (donation.volunteer.toString() !== userID) {
            return res.json({ success: false, message: "Only volunteer can update" });
        }

        donation.status = "planted";
        donation.plantedAt = new Date();
        await donation.save();

        // update plant
        const plant = await Plant.findById(donation.plant);
        plant.status = "planted";
        await plant.save();

        res.json({ success: true, message: "Plant marked as planted 🌱" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


//  GET MY PICKED PLANTS 
export const getMyPickedPlants = async (req, res) => {
    try {
        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user || !user.isAccountVerified) {
            return res.json({ success: false, message: "User not verified" });
        }

        const donations = await Donation.find({ volunteer: userID })
            .populate("plant")
            .populate("donor", "name email")
            .populate("volunteer", "name email phone");

        res.json({ success: true, donations });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// GET MY DONATED PLANTS 
export const getMyDonations = async (req, res) => {
    try {
        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user || !user.isAccountVerified) {
            return res.json({ success: false, message: "User not verified" });
        }
        
        const donations = await Donation.find({ donor: userID })
            .populate("plant")
              .populate("volunteer", "name email phone");

        res.json({ success: true, donations });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


//  CANCEL DONATION 
export const cancelDonation = async (req, res) => {
    try {
        const { donationID } = req.body;
        const { userID } = req;

        const donation = await Donation.findById(donationID);
        if (!donation) {
            return res.json({ success: false, message: "Donation not found" });
        }

        if (
            donation.donor.toString() !== userID &&
            donation.volunteer.toString() !== userID
        ) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        donation.status = "cancelled";
        await donation.save();

        // make plant available again
        const plant = await Plant.findById(donation.plant);
        plant.status = "available";
        await plant.save();

        res.json({ success: true, message: "Cancelled successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};