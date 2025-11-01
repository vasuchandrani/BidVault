import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js"
import { handleAutoBids } from "../services/autoBid.service.js";
import { bidLogger } from "../services/bidLogger.js"

export const placeBid = async (req, res) => {

  const { auctionId } = req.params;
  const { amount } = req.body;
  const userId = req.user._id;
  
  const bid = Bid.findOne({ auctionId, userId });
  if (!bid) {
    bid = await Bid.create({
      auctionId: auctionId,
      userId: userId,
      amount: amount
    });
  }
  else {
    bid.amount = amount;
    bid.lastPlacedAt = Date.now();
  }

  const auction = await Auction.findOne({ auctionId });
  auction.currentBid = bid.amount;
  auction.currentWinner = userId;
  auction.totalBids += 1;

  bidLogger(`User ${userId} placed a bid amount of ${nextBid} -- Manual-bid`);
  await auction.save();

  handleAutoBids(auctionId);

  return res.status(200).json("Bid placed successfully");
};