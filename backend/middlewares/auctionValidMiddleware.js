export const validateAuctionPayload = (req, res, next) => {

  const { item, startingPrice, startTime, endTime } = req.body;
  
  if (!item || !item.name || !startingPrice || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: "Missing required auction fields" });
  }
  
  // check auction information and give response accordingly 

  next();
};