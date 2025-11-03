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
}, { timestamps: true });

bidSchema.index({ auctionId: 1, amount: -1 });

export default mongoose.model("bid", bidSchema);