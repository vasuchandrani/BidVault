// backend/routes/bidRoutes.js
import express from "express";
import { placeBid } from "../controllers/bidController.js" 
import { setAutoBid, deactivateAutoBid, activateAutoBid } from "../controllers/autobidController.js";
import { restrictToLoggedinUserOnly } from "../middlewares/authMiddleware.js";
import { validateBid, validAutoBid } from "../middlewares/bidValidMiddleware.js";

const router = express.Router();

//bid
router.post("/place", restrictToLoggedinUserOnly, validateBid, placeBid);

//auto bid
router.post("/autobid/set", restrictToLoggedinUserOnly, validAutoBid, setAutoBid);

router.post("/autobid/deactivate", restrictToLoggedinUserOnly, deactivateAutoBid);

router.post("/autobid/activate", restrictToLoggedinUserOnly, validAutoBid, activateAutoBid);

export default router;
