import Auction from "../models/Auction.js";
import User from "../models/User.js"
import Product from "../models/Product.js";
import { logAuctionEvent } from "../services/logger.service.js";
import { pushAdminNotification } from "../services/notification.service.js";

/**
 * Create Auction
 */
export async function createAuction(req, res) {
  try {
    const {
      title,
      startingPrice,
      minIncrement,
      buyItNow,
      startTime,
      endTime,
    } = req.body;

    const userId = req.user._id;
    const start = new Date(startTime);
    const end = new Date(endTime);
    // New auctions start as "YET_TO_BE_VERIFIED" until admin verifies them
    const status = "YET_TO_BE_VERIFIED";

    const now = new Date();
    const regOpenTime = new Date(start.getTime() - 24 * 60 * 60 * 1000);

    let isRegistrationOpen = now >= regOpenTime && now < start;

    // create product
    const product = await Product.create(req.productData)

    // create auction
    const auction = await Auction.create({
      title: String(title).trim(),
      product: product,
      createdBy: userId,
      status,
      verified: false,
      startingPrice: Number(startingPrice),
      minIncrement: Number(minIncrement),
      buyItNow,
      currentBid: 0,
      startTime: start,
      endTime: end,
      autoBidders: [],
      registrations: [],
      isRegistrationOpen,
      totalBids: 0,
      totalParticipants: 0,
    });

    product.auctionId = auction._id;
    await product.save();

    // logs
    const auctionOwner = await User.findById(userId);
    await logAuctionEvent({
      auctionId: auction._id,
      userId: auctionOwner._id,
      userName: auctionOwner.username,
      type: "AUCTION_CREATED",
      details: {
        itemName: name,
        startingPrice,
        minIncrement,
        startTime,
        endTime,
      },
    });

    // admin-Notification 
    await pushAdminNotification({
      auctionId: auction._id,
      userId: req.user._id,
      type: "AUCTION_VERIFICATION",
    })

    return res.status(201).json({
      success: true,
      message: "Auction created successfully",
      auction,
    });
  } catch (err) {
    console.error("createAuction error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Edit auction details (only before 1 days of auction start)
 * Editable fields: startTime, endTime, minIncrement, startingPrice, item.description, item.images
 */
export const editAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user._id;
    const updates = req.validUpdates;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }

    if (auction.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this auction" });
    }

    // edit info before 1 days of auction starts
    const now = new Date();
    const timeDifference = auction.startTime - now; // in ms
    const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

    if (daysLeft <= 1) {
      return res.status(400).json({
        success: false,
        message: "You can only edit auction details up to 1 days before it starts.",
      });
    }

    // update auction
    const updatedAuction = await Auction.findByIdAndUpdate(
      auctionId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    // logs
    const auctionOwner = await User.findById(userId);
    await logAuctionEvent({
      auctionId: updatedAuction._id,
      userId: auctionOwner._id,
      userName: auctionOwner.username,
      type: "AUCTION_UPDATED",
      details: {
        updatedFields: Object.keys(updates),
        newValues: updates,
      },
    });

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
    const { auctionId } = req.params;
    const userId = req.user._id;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }

    if (auction.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this auction" });
    }

    // delete auction is only allowed before 1 days of auction starts
    const now = new Date();
    const timeDifference = auction.startTime - now; // in ms
    const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

    if (daysLeft <= 1) {
      return res.status(400).json({
        success: false,
        message: "You can only delete auction up to 1 days before it starts.",
      });
    }

    // delete - not actually 
    await Auction.findByIdAndUpdate(
      auctionId,
      { $set: { status: "CANCELLED" } },
    );

    // logs
    const auctionOwner = await User.findById(userId);
    await logAuctionEvent({
      auctionId: auction._id,
      userId: auctionOwner._id,
      userName: auctionOwner.username,
      type: "AUCTION_DELETED",
      details: {
        deletedAt: new Date(),
        auctionData: auction, 
      },
    });


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

/**
 * Registration for an auction is strat before 24 hr.
 * it's end when last 5 minutes remaining of the auction.
 * 
 * bidvault/auctions/:auctionId/au-registration
 *    email: .........
 *    |pay| <- click
 * redirect to 
 * bidvault/auctions/:auctionId/au-registration/pay
 */
export const handleRegisterInAuction = async (req, res) => {
  try {
    const { email } = req.body;
    const {auctionId} = req.params;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(400).json({ success: false, message: "Auction not found" });
    } 

    const user = await User.findOne({ email });
    if (!user) {
      // redirect to login page
      return res.status(400).json({ success: false, message: "User not found" });
    }
    
    if(user._id === auction.createdBy){
      return res.status(400).json({ success: false, message: "You are seller"});
    }

    return res.json({
      success: true,
      redirectUrl: `/bidvault/auctions/${auctionId}/au-registration/pay`
    });

  }
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}