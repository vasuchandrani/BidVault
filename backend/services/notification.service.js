import AdminNotification from "../models/AdminNotification.js";

export const pushAdminNotification = async ({
  auctionId,
  userId,
  type,
  payment,
  status = "PENDING",
}) => {
  try {
    await AdminNotification.findOneAndUpdate(
      { auctionId },
      {
        $push: {
          notifications: {
            userId,
            type,
            payment,
            status,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Error pushing admin notification:", err.message);
  }
};