import express from "express";
import {
  createAuction,
  editAuction,
  deleteAuction,
  getAuction,
  listAuctions,
  handleRegisterInAuction
} from "../controllers/auctionController.js";
import { restrictToLoggedinUserOnly } from "../middlewares/authMiddleware.js";
import { validateAuctionPayload, validateAuctionEditPayload } from "../middlewares/auctionValidMiddleware.js";

const router = express.Router();

router.post("/create", restrictToLoggedinUserOnly, validateAuctionPayload, createAuction);

router.post("/:auctionId", restrictToLoggedinUserOnly, validateAuctionEditPayload, editAuction);

router.delete("/:auctionId", restrictToLoggedinUserOnly, deleteAuction);

router.post("/:auctionId/au-registration", restrictToLoggedinUserOnly, handleRegisterInAuction)

router.get("/:auctionId", getAuction);

router.get("/", listAuctions);

export default router;