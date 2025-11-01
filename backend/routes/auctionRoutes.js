import express from "express";
import {
  createAuction,
  editAuction,
  deleteAuction,
  getAuction,
  listAuctions,
} from "../controllers/auctionController.js";
import { restrictToLoggedinUserOnly } from "../middlewares/authMiddleware.js";
import { validateAuctionPayload } from "../middlewares/auctionValidMiddleware.js";

const router = express.Router();

router.post("/create/:userId", restrictToLoggedinUserOnly, validateAuctionPayload, createAuction);

router.post("/:auctionId/:userId", restrictToLoggedinUserOnly, editAuction);

router.delete("/:auctionId/:userId", restrictToLoggedinUserOnly, deleteAuction);

router.get("/:auctionId", getAuction);

router.get("/", listAuctions);

export default router;