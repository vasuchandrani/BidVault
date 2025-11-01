import Auction from "../models/Auction.js";
import AutoBid from "../models/AutoBid.js";
import Bid from "../models/Bid.js";

/**
 * Auto-bid trigger logic:
 * Called every time a new bid is placed manually
 */
export const handleAutoBids = async (auctionId) => {

  const auction = await Auction.findById(auctionId);
  if (!auction || auction.status !== "LIVE") return;

  const currentBid = auction.currentBid;
  const minIncrement = auction.minIncrement;

  // Find all active autobidders for this auction
  const autoBidders = await AutoBid.find({ auctionId });

  if (!autoBidders.length) return;

  // Sort bidders by remaining balance (descending)
  autoBidders.sort((a, b) => b.maxLimit - a.maxLimit);

  let newBidPlaced = false;

  for (const bidder of autoBidders) {

    if (String(bidder.userId) === String(auction.currentWinner)) continue; // skip current winner

    const nextBid = currentBid + minIncrement;

    // Stop if exceeds user's limit
    if (nextBid > bidder.maxLimit) { 
      continue;
      // send email to user that his/her maxLimit is outdated 
    }

    // Place the automatic bid
    await Bid.create({
      auctionId,
      userId: bidder.userId,
      amount: nextBid,
    });

    // Update auction
    auction.currentBid = nextBid;
    auction.currentWinner = bidder.userId;
    auction.totalBids += 1;
    await auction.save();

    newBidPlaced = true;
    break; // only one auto-bid triggers at a time
  }

  // If a new bid was placed, re-check recursively — maybe other autobidders want to respond
  if (newBidPlaced) {
    await handleAutoBids(auctionId);
  }
};