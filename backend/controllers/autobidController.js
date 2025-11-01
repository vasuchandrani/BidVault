import AutoBid from "../models/AutoBid.js"
import Auction from "../models/Auction.js";

export const setAutoBid = async (req, res) => {
  
  const { auctionId, userId, maxLimit } = req.body;

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

   if (autobid.isActive && auction.status == "LIVE" && (auction.currentBid == 0 || auction.currentBid < maxLimit)) {
      const nextBid = auction.currentBid
        ? auction.currentBid + auction.minIncrement
        : auction.startingPrice;

      // Only bid if within user's max limit
      if (nextBid <= maxLimit) {
        auction.currentBid = nextBid;
        auction.currentWinner = userId;
        auction.totalBids += 1;

        await auction.save();
      }
    }
  res.status(200).json(autobid);
};

export const editAutoBid = async (req, res) => {
  try {
    const { auctionId, userId, newMaxLimit } = req.body;

    if (!auctionId || !userId || !newMaxLimit) {
      return res.status(400).json({
        success: false,
        message: "auctionId, userId, and newMaxLimit are required",
      });
    }

    const autobid = await AutoBid.findOne({ auctionId, userId });
    if (!autobid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid not found for this user and auction",
      });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    autobid.maxLimit = newMaxLimit;
    await autobid.save();

    if (autobid.isActive && auction.currentWinner?.toString() !== userId.toString()) {
      const nextBid = auction.currentBid + auction.minIncrement;

      if (nextBid <= newMaxLimit) {
        auction.currentBid = nextBid;
        auction.currentWinner = userId;
        auction.totalBids += 1;

        await auction.save();
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
    const { auctionId, userId } = req.body;
    // const userId = req.user._id;  

    if (!auctionId) {
      return res.status(400).json({
        success: false,
        message: "auctionId is required",
      });
    }

    const existingAutoBid = await AutoBid.findOne({ auctionId, userId });

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
    const { auctionId, userId } = req.body;
    // const userId = req.user._id; 

    if (!auctionId) {
      return res.status(400).json({
        success: false,
        message: "auctionId is required",
      });
    }

    const existingAutoBid = await AutoBid.findOne({ auctionId, userId });
    if (!existingAutoBid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid not found for this user and auction",
      });
    }

    existingAutoBid.isActive = false;
    await existingAutoBid.save();

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

// export const removeAutoBid = async (req, res) => {

//   const { auctionId, userId } = req.body;

//   const result = await AutoBid.findOneAndDelete({
//     auctionId: auctionId,
//     userId: userId,
//   });

//   if (!result) {
//     return res.status(404).json({ error: "Auto-bid not found for this user or auction." });
//   }

//   res.status(200).json({ success: true, message: "Auto-bid removed successfully." });
// };