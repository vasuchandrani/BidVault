import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
  item: {
    name: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    metadata: { type: Object },
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: ["UPCOMING", "LIVE", "ENDED", "CANCELLED"],
    default: "LIVE",
  },

  startingPrice: { 
    type: Number, 
    required: true 
  },
  minIncrement: { 
    type: Number, 
    required: true 
  },
  currentBid: { 
    type: Number, 
    default: 0 
  },
  currentWinner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },

  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },

  autoBidders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  totalBids: { type: Number, default: 0 },
  totalParticipants: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

auctionSchema.index({ status: 1, endTime: 1 });

export default mongoose.model("Auction", auctionSchema);