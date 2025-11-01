import Auction from "../models/Auction.js";

export const validateBid = async (req, res, next) => {

  const { auctionId, userId, amount } = req.body;
  
  // auction id is required and amount must be a number
  if (!auctionId || typeof amount !== "number") {
    return res.status(400).json({ success: false, message: "auctionId and numeric amount are required" });
  }
  
  // amount must be greater then zero and last highest-bid
  if (amount <= 0) {
    return res.status(400).json({ success: false, message: "amount must be greater than zero" });
  }

  const auction = await Auction.findOne({ _id : auctionId })
  if (amount <= auction.currentBid || amount <= auction.startingPrice) {
    return res.status(400).json({ success: false, message: "amount must be greater than Highest-Bid or starting-Price" });
  }
  
  // seller can not bid 
  if (auction.createdBy.toString() === userId.toString()) {
    return res.status(400).json({ success: false, message: "You are seller, you can't bid in your auction" });
  }
  
  next();
};

export const validateAutoBid = async (req, res, next) => {

  const { auctionId, maxLimit } = req.body;

  // auction id is required and maxLimit must be a number
  if (!auctionId || typeof maxLimit !== "number") {
    return res.status(400).json({ success: false, message: "auctionId and numeric amount are required" });
  }

  // seller can not set auto-bid
  const auction = await Auction.findOne({ _id : auctionId })
  const userId = req.user._id; 
  if (userId === auction.createdBy) {
    return res.status(400).json({ success: false, message: "You are seller, you can't set auto-bid in your auction" });
  }

  if (maxLimit < auction.startingPrice) {
    return res.status(400).json({ success: false, message: "Your maxLimit is too low" }); 
  }
  
  next();
}