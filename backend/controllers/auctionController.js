import Auction from "../models/Auction.js";
import { auctionLogger } from "../services/auctionLogger.js";

/**
 * Create Auction
 */
export const createAuction = async (req, res) => {
  try {
    const { item, startingPrice, minIncrement, startTime, endTime } = req.body;
    const { userId } = req.params;

    const createdBy = userId;

    const auction = await Auction.create({
      item,
      startingPrice,
      minIncrement,
      startTime,
      endTime,
      createdBy,
    });

    auctionLogger(`User ${req.user._id} created an auction ${auction._id}`);

    res.status(201).json({ success: true, auction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Edit auction details (only before 2 days of auction start)
 * Editable fields: startTime, endTime, minIncrement, startingPrice, item.description, item.images
 */
export const editAuction = async (req, res) => {
  try {
    const { auctionId, userId } = req.params;
    const updates = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }

    if (auction.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this auction" });
    }

    // edit info before 2 days of auction starts
    const now = new Date();
    const timeDifference = auction.startTime - now; // in ms
    const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

    if (daysLeft <= 2) {
      return res.status(400).json({
        success: false,
        message: "You can only edit auction details up to 2 days before it starts.",
      });
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      auctionId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    auctionLogger(`User ${req.user._id} edit the auction ${auction._id}`);

    return res.status(200).json({
      success: true,
      message: "Auction updated successfully",
      auction: updatedAuction,
    });
  } 
  catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating auction",
      error: err.message,
    });
  }
};

/**
 * Delete (or cancel) auction
 */
export const deleteAuction = async (req, res) => {
  try {
    const { auctionId, userId } = req.params;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }

    if (auction.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this auction" });
    }

    // delete auction is only allowed before 2 days of auction starts
    const now = new Date();
    const timeDifference = auction.startTime - now; // in ms
    const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

    if (daysLeft <= 2) {
      return res.status(400).json({
        success: false,
        message: "You can only delete auction up to 2 days before it starts.",
      });
    }

    await Auction.findOneAndDelete({ auctionId, userId });

    auctionLogger(`User ${req.user._id} delete the auction ${auction._id}`);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Get single auction
 */
export const getAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findOne({ auctionId });
    
    res.status(200).json({ success: true, auction });
  } 
  catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * List auctions (simple pagination & filters)
 * to filter all the auctions based on status.
 */
export const listAuctions = async (req, res) => {
  try {
    const { status } = req.query;
    const result = await Auction.find({ status });
    
    res.status(200).json({ success: true, result });
  } 
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};