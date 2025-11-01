import AutoBid from "../models/AutoBid.js"
import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";
import { bidLogger } from "../services/bidLogger.js"
import { autobidLogger } from "../services/autobidLogger.js";

export const setAutoBid = async (req, res) => {
  
  const { auctionId } = req.params;
  const { userId, maxLimit } = req.body;
  // const userId = req.user._id;

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return res.status(404).json({ success: false, message: "Auction not found" });
  }
    
  //Check if user already has an autobid for this auction
  const existingAutoBid = await AutoBid.findOne({ auctionId, userId });
  if (existingAutoBid) {
    return res.status(400).json({
    success: false,
    message: "Auto-bid already set for this auction" });
  }

  const autobid = await AutoBid.create({
    auctionId: auctionId,
    userId: userId,
    maxLimit: maxLimit,
  });

  // push autobidder
  if (!auction.autoBidders.some(id => String(id) === String(userId))) {
    auction.autoBidders.push(userId);
    await auction.save();
  }

  autobidLogger(`User ${userId} set autobid with maximum limit: ${maxLimit}`);

   if (autobid.isActive && auction.status == "LIVE" && (auction.currentBid == 0 || auction.currentBid < maxLimit)) {
      const nextBid = auction.currentBid
        ? auction.currentBid + auction.minIncrement
        : auction.startingPrice;

      // Only bid if within user's max limit
      if (nextBid <= maxLimit) {
        auction.currentBid = nextBid;
        auction.currentWinner = userId;
        auction.totalBids += 1;

        autobid.lastBidAmount = nextBid;
        autobid.totalAutoBidsPlaced += 1;

        const bid = await Bid.findOne({ auctionId, userId });
        if (!bid) {
          await Bid.create({
            auctionId: auctionId,
            userId: userId,
            amount: nextBid
          });
        }
        else {
          bid.amount = nextBid;
          bid.lastPlacedAt = Date.now();
          await bid.save();
        }

        bidLogger(`User ${userId} placed a bid amount of ${nextBid} -- Autobid`);
        await auction.save();
        await autobid.save();
      }
    }
  res.status(200).json(autobid);
};

export const editAutoBid = async (req, res) => {
  try {
    const { newMaxLimit } = req.body;
    const { autobidId } = req.params;

    if (!autobidId) {
      return res.status(400).json({
        success: false,
        message: "This Autobid is not in DB",
      });
    }

    const autobid = await AutoBid.findById(autobidId);
    if (!autobid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid not found for this user and auction",
      });
    }

    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.status === "ENDED" || auction.status === "CANCELLED") {
      return res.status(404).json({
        success: false,
        message: "No updatation allowed for Autobid in this Auction",
      });
    }

    autobid.maxLimit = newMaxLimit;
    await autobid.save();

    autobidLogger(`User ${userId} update the max limit to ${newMaxLimit}`);

    if (auction.status == "LIVE" && autobid.isActive && auction.currentWinner?.toString() !== userId.toString()) {
      const nextBid = auction.currentBid + auction.minIncrement;

      if (nextBid <= newMaxLimit) {
        auction.currentBid = nextBid;
        auction.currentWinner = userId;
        auction.totalBids += 1;

        autobid.lastBidAmount = nextBid;
        autobid.totalAutoBidsPlaced += 1;

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

        bidLogger(`User ${userId} placed a bid amount of ${nextBid} -- Autobid`);
        await auction.save();
        await autobid.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Auto-bid max limit updated successfully",
      data: autobid,
    });
  } 
  catch (err) {
    console.error("Error editing auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const activateAutoBid = async (req, res) => {
  
  try {
    const { auctionId, autobidId } = req.params;
    const { userId } = req.body;
    // const userId = req.user._id;

    const existingAutoBid = await AutoBid.findById(autobidId);
    if (!existingAutoBid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid record not found for this user and auction",
      });
    }
 
    if (existingAutoBid.isActive) {
      return res.status(200).json({
        success: true,
        message: "Auto-bid is already active",
      });
    }

    existingAutoBid.isActive = true;
    await existingAutoBid.save();

    autobidLogger(`User ${userId} activated the autobid ${autobidId}`)

    await Auction.findByIdAndUpdate(auctionId, {
      $addToSet: { autoBidders: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Auto-bid activated successfully",
    });
  } 
  catch (err) {
    console.error("Error activating auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const deactivateAutoBid = async (req, res) => {
  try {
    const { auctionId, autobidId } = req.params;
    const { userId } = req.body;
    // const userId = req.user._id; 

    const existingAutoBid = await AutoBid.findById(autobidId);
    if (!existingAutoBid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid not found for this user and auction",
      });
    }

    existingAutoBid.isActive = false;
    await existingAutoBid.save();

    autobidLogger(`User ${userId} deactivated the autobid ${autobidId}`)

    await Auction.findByIdAndUpdate(auctionId, {
      $pull: { autoBidders: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Auto-bid cancelled successfully",
    });
  } 
  catch (err) {
    console.error("Error cancelling auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};