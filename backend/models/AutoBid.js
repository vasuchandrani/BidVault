import mongoose from "mongoose";

const autoBidSchema = new mongoose.Schema({
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

  // Autobid setup/config
  maxLimit: { 
    type: Number, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  activatedAt: { 
    type: Date, 
    default: Date.now 
  },

  // Trigger tracking
  lastBidAmount: { 
    type: Number, 
    default: 0 
  },
  totalAutoBidsPlaced: { 
    type: Number, 
    default: 0 
  },
  lastTriggeredAt: { type: Date },
});

// Query: find autobid for a user in a specific auction
autoBidSchema.index({ auctionId: 1, userId: 1 }, { unique: true });

// Query: find all active autobids for a running auction
autoBidSchema.index({ auctionId: 1, isActive: 1 });

// Query: sort by last triggered time (recently active)
autoBidSchema.index({ lastTriggeredAt: -1 });

// Query: list all autobids created by a user
autoBidSchema.index({ userId: 1 });

const Autobid = mongoose.model("autobid", autoBidSchema);

export default Autobid;