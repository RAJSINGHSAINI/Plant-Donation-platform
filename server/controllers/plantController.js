import fs from "fs";
import path from "path";
import Plant from "../models/Plant.js";
import userModel from "../models/user.js";

//  ADD PLANT
export const addPlant = async (req, res) => {
    try {
        const { userID } = req;

        const {
            name,
            description,
            category,
            quantity,
            street,
            city,
            state,
            pincode
        } = req.body;

        if (!name || !description || !category) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const user = await userModel.findById(userID);
        if (!user || !user.isAccountVerified) {
            return res.json({ success: false, message: "User not verified" });
        }

        const coverImage = req.files?.coverImage?.[0]?.filename || null;

        const images = req.files?.images
            ? req.files.images.map(file => file.filename)
            : [];

        const newPlant = new Plant({
            owner: userID,
            name,
            description,
            category,
            quantity,
            address: { street, city, state, pincode },
            coverImage,
            images
        });

        await newPlant.save();

        res.json({
            success: true,
            message: "Plant added successfully",
            plant: newPlant
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//  GET ALL AVAILABLE PLANTS
export const getAllPlants = async (req, res) => {
    try {
        const plants = await Plant.find({ status: "available" })
            .populate("owner", "name");
        
        res.json({ success: true, plants });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//  GET SINGLE PLANT
export const getPlant = async (req, res) => {
    try {
        const plantID = req.params.id;

        const plant = await Plant.findById(plantID)
            .populate("owner", "name email address");

        if (!plant) {
            return res.json({ success: false, message: "Plant not found" });
        }
        
        res.json({ success: true, plant });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//  GET USER'S DONATED PLANTS
export const getMyPlants = async (req, res) => {
    try {
        const { userID } = req;

        const plants = await Plant.find({ owner: userID });

        res.json({ success: true, plants });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// UPDATE PLANT
export const updatePlant = async (req, res) => {
    try {
        const { userID } = req;
        const { plantID } = req.body;

        const plant = await Plant.findById(plantID);

        if (!plant) {
            return res.json({ success: false, message: "Plant not found" });
        }

        if (plant.owner.toString() !== userID) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        
        const {
            name,
            description,
            category,
            quantity,
            street,
            city,
            state,
            pincode,
        } = req.body;
        const status = req.body.status?.toLowerCase() || plant.status.toLowerCase(); 
        let coverImage = plant.coverImage;

        if (req.files?.coverImage) {
            if (plant.coverImage) {
                const oldPath = path.join(process.cwd(), "uploads", plant.coverImage);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            coverImage = req.files.coverImage[0].filename;
        }

        let images = plant.images;

        if (req.files?.images) {
            plant.images.forEach(img => {
                const imgPath = path.join(process.cwd(), "uploads", img);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            });

            images = req.files.images.map(file => file.filename);
        }

        if(plant.status === 'assigned' || plant.status === 'picked') {
            if(status === "available" || status === "planted") {
                return res.json({success: false, message: "cannot update assigned or picked plant to available or planted status"});   
            }
        };

        const updatedPlant = await Plant.findByIdAndUpdate(
            plantID,
            {
                name,
                description,
                category,
                quantity,
                address: { street, city, state, pincode },
                coverImage,
                images,
                status
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Plant updated",
            plant: updatedPlant
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//  DELETE PLANT
export const deletePlant = async (req, res) => {
    try {
        const { userID } = req;
        const plantID = req.params.id;

        const plant = await Plant.findById(plantID);

        if (!plant) {
            return res.json({ success: false, message: "Plant not found" });
        }

        if (plant.owner.toString() !== userID) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // delete images
        if (plant.coverImage) {
            const pathImg = path.join(process.cwd(), "uploads", plant.coverImage);
            if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
        }

        plant.images.forEach(img => {
            const imgPath = path.join(process.cwd(), "uploads", img);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });

        await Plant.findByIdAndDelete(plantID);

        res.json({ success: true, message: "Plant deleted" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};