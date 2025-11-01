import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  lastPlacedAt: {
    type: Date,
    default: Date.now,
  },
});

bidSchema.index({ auctionId: 1, amount: -1 });

export default mongoose.model("Bid", bidSchema);