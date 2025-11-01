import Bid from "../models/Bid.js"
import { handleAutoBids } from "../services/autoBid.service.js";
import { bidLogger } from "../services/bidLogger.js"

export const placeBid = async (req, res) => {

  const { auctionId, userId, amount } = req.body;

  const bid = await Bid.create({
    auctionId: auctionId,
    userId: userId,
    amount: amount
  });

  // log

  handleAutoBids(auctionId);

  return res.status(200).json("Bid placed successfully");
};