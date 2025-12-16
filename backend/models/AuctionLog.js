import mongoose from "mongoose";

const logEntrySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "user" 
  },
  userName: { 
    type: String,
    default: "System",
    required: true
  },
  type: {
    type: String,
    enum: [
      "BID_PLACED",
      "AUTO_BID_TRIGGERED",
      "AUTO_BID_SET",
      "AUTO_BID_EDITED",
      "AUTO_BID_ACTIVATED",
      "AUTO_BID_DEACTIVATED",
      "AUCTION_CREATED",
      "AUCTION_UPDATED",
      "AUCTION_DELETED",
      "AUCTION_STARTED",
      "AUCTION_ENDED",
      "AUCTION_CANCELLED",
      "AUCTION_EXTENDED",
      "AUCTION_WINNER_DECLARED"
    ],
    required: true
  },
  details: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
}, 
{ _id: false } // subdocs don’t need separate IDs
);

const auctionLogSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "auction",
    required: true,
    unique: true
  },
  logs: [ logEntrySchema ],
},{ timestamps: true });


// Query: find all auctions where user participated
auctionLogSchema.index({ "logs.userId": 1 });

// Query: find all logs of a specific type (e.g. BID_PLACED)
auctionLogSchema.index({ "logs.type": 1 });


const AuctionLog = mongoose.model("auctionLog", auctionLogSchema);

export default AuctionLog;