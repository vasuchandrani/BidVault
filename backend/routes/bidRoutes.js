// backend/routes/bidRoutes.js
import express from "express";
import { placeBid } from "../controllers/bidController.js" 
import { setAutoBid, deactivateAutoBid, activateAutoBid, editAutoBid } from "../controllers/autobidController.js";
import { restrictToLoggedinUserOnly } from "../middlewares/authMiddleware.js";
import { validateBid, validateAutoBid } from "../middlewares/bidValidMiddleware.js";

const router = express.Router();

// /bidvault/:auctionid/bid
//bid
router.post("/place", restrictToLoggedinUserOnly, validateBid, placeBid);

//autobid
router.post("/setauto", restrictToLoggedinUserOnly, validateAutoBid, setAutoBid);

router.post("/editauto/:autobidId", restrictToLoggedinUserOnly, validateAutoBid, editAutoBid);

router.post("/deactivateauto/:autobidId", restrictToLoggedinUserOnly, deactivateAutoBid);

router.post("/activateauto/:autobidId", restrictToLoggedinUserOnly, validateAutoBid, activateAutoBid);

export default router;