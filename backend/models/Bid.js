import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "auction",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  oldBidAmounts: [Number], 
}, { timestamps: true });

// Query: get bid placed by a specific user in a specific auction
bidSchema.index({ userId: 1, auctionId: 1 }, { unique: true });

// Query: find the highest bid (or top N bids) for a specific auction
bidSchema.index({ auctionId: 1, amount: -1 });

const Bid = mongoose.model("bid", bidSchema);

export default Bid;