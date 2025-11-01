import Auction from "../models/Auction.js";
import AutoBid from "../models/AutoBid.js";
import Bid from "../models/Bid.js"
import { handleAutoBids } from "../services/autoBid.service.js";
import { bidLogger } from "../services/bidLogger.js"

export const placeBid = async (req, res) => {

  const { auctionId } = req.params;
  const { amount, userId } = req.body;
  // const userId = req.user._id;

  // check if user have activated autobid
  const autobid = await AutoBid.findOne({ auctionId, userId });
  if (autobid && autobid.isActive) {
    return res.status(400).json({
      success: false,
      message: "You have already activated auto-bid for this auction"
    });
  }

  const bid = await Bid.findOne({ auctionId, userId });
  if (!bid) {
    await Bid.create({
      auctionId: auctionId,
      userId: userId,
      amount: amount
    });
  }
  else {
    bid.amount = amount;
    bid.lastPlacedAt = Date.now();
    await bid.save();
  }

  const auction = await Auction.findById(auctionId);
  auction.currentBid = amount;
  auction.currentWinner = userId;
  auction.totalBids += 1;

  bidLogger(`User ${userId} placed a bid amount of ${amount} -- Manual-bid`);
  await auction.save();

  handleAutoBids(auctionId);

  return res.status(200).json("Bid placed successfully");
};