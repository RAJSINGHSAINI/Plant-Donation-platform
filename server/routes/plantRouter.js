import express from "express";

import {addPlant,getPlant,getAllPlants,getMyPlants,updatePlant,deletePlant} from "../controllers/plantController.js";

import { userAuth } from "../middleware/userAuth.js";
import { uploadPlantImages } from "../config/multer.js";

export const plantRouter = express.Router();
plantRouter.post("/add-plant", userAuth, uploadPlantImages, addPlant);
plantRouter.get("/get-all-plants", userAuth, getAllPlants);
plantRouter.get("/get-plant/:id", userAuth, getPlant);
plantRouter.get("/my-plants", userAuth, getMyPlants);
plantRouter.put("/update-plant", userAuth, uploadPlantImages, updatePlant);
plantRouter.delete("/delete-plant/:id", userAuth, deletePlant);