import mongoose from "mongoose";

const connectDB = async () => {
    try {
      mongoose.connect("mongodb://localhost:27017/BidVault")
      
    } catch (error) {
      console.log("config error");
    }
}

export default connectDB;