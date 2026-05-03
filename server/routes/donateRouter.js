import express from "express";
import {pickPlant,confirmPickup,markPlanted,getMyPickedPlants,getMyDonations,cancelDonation} from "../controllers/donateController.js";
import { userAuth } from "../middleware/userAuth.js";

export const donationRouter = express.Router();

donationRouter.post("/pick", userAuth, pickPlant);
donationRouter.post("/confirm-pickup", userAuth, confirmPickup);
donationRouter.post("/mark-planted", userAuth, markPlanted);
donationRouter.get("/my-picked", userAuth, getMyPickedPlants);
donationRouter.get("/my-donations", userAuth, getMyDonations);
donationRouter.post("/cancel", userAuth, cancelDonation);