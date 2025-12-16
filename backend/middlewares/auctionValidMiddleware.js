export async function validateAuctionPayload(req, res, next) {

  const { title, name, category, condition, startingPrice, minIncrement, buyItNow, startTime, endTime } = req.body;

  if (!title || String(title).trim() === "") {
    return res.status(400).json({ 
      success: false, 
      message: "Auction title is required" 
    });
  }

  if (!name || String(name).trim() === "") {
    return res.status(400).json({ 
      success: false, 
      message: "Product name is required" 
      });
  }

  if (!category || String(category).trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Category is required and must be a non-empty string"
    });
  }

  const allowedConditions = ["new", "like new", "good", "fair"];
  if (!condition || !allowedConditions.includes(condition)) {
    return res.status(400).json({
      success: false,
      message: `Condition must be one of: ${allowedConditions.join(", ")}`
    });
  }

  const sp = Number(startingPrice);
  if (!Number.isFinite(sp) || sp < 0) {
    return res.status(400).json({ 
      success: false,
      message: "startingPrice is required and must be a non-negative number" 
    });
  }

  const mi = Number(minIncrement);
  if (!Number.isFinite(mi) || mi <= 0) {
    return res.status(400).json({ 
      success: false,
      message: "minIncrement is required and must be a positive number" 
    });
  }

  if (buyItNow !== undefined && buyItNow !== null && buyItNow !== "") {
    const bn = Number(buyItNow);

    if (!Number.isFinite(bn) || bn < 0) {
      return res.status(400).json({
        success: false,
        message: "buyItNow must be a non-negative number"
      });
    }

    if (bn < sp) {
      return res.status(400).json({
        success: false,
        message: "buyItNow must be greater than or equal to startingPrice"
      });
    }
  }

  if (!startTime || !endTime) {
    return res.status(400).json({ 
      success: false, 
      message: "startTime and endTime are required" 
    });
  }

  const s = new Date(startTime);
  const e = new Date(endTime);
  
  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid startTime or endTime" 
    });
  }

  if (e <= s) {
    return res.status(400).json({ 
      success: false, 
      message: "endTime must be after startTime" 
    });
  }

  const uploadedImages = [];
  const uploadFolder = `auctions/${title.trim().replace(/\s+/g, "_")}`;

  if (Array.isArray(images) && images.length > 0) {
    for (const img of images) {
      const uploaded = await cloudinary.uploader.upload(img, {
        folder: uploadFolder,
      });
      uploadedImages.push(uploaded.secure_url);
    }
  }

  req.productData = {
    name: name.trim(),
    category: category.trim(),
    condition,
    images: uploadedImages,
    metadata: metadata || {},
    description: description?.trim(),
  };

  next();
}

export const validateAuctionEditPayload = (req, res, next) => {
  try {
    const allowedFields = [
      "startTime",
      "endTime",
      "minIncrement",
      "startingPrice",
      "description",
      "images"
    ];

    const updates = req.body;

    // check for invalid fields
    const invalidFields = Object.keys(updates).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields in update: ${invalidFields.join(", ")}`,
      });
    }

    const validUpdates = {};

    if ("startTime" in updates) {
      const start = new Date(updates.startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startTime",
        });
      }
      validUpdates.startTime = start;
    }

    if ("endTime" in updates) {
      const end = new Date(updates.endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endTime",
        });
      }

      if ("startTime" in updates) {
        const start = new Date(updates.startTime);
        if (end <= start) {
          return res.status(400).json({
            success: false,
            message: "endTime must be after startTime",
          });
        }
      }

      validUpdates.endTime = end;
    }

    if ("minIncrement" in updates) {
      const mi = Number(updates.minIncrement);
      if (!Number.isFinite(mi) || mi <= 0) {
        return res.status(400).json({
          success: false,
          message: "minIncrement must be a positive number",
        });
      }
      validUpdates.minIncrement = mi;
    }

    if ("startingPrice" in updates) {
      const sp = Number(updates.startingPrice);
      if (!Number.isFinite(sp) || sp < 0) {
        return res.status(400).json({
          success: false,
          message: "startingPrice must be a non-negative number",
        });
      }
      validUpdates.startingPrice = sp;
    }

    if ("description" in updates) {
      const desc = String(updates.description).trim();
      if (desc.length === 0) {
        return res.status(400).json({
          success: false,
          message: "description cannot be empty",
        });
      }
      validUpdates.description = desc;
    }

    if ("images" in updates) {
      if (!Array.isArray(updates.images)) {
        return res.status(400).json({
          success: false,
          message: "images must be an array of strings",
        });
      }

      const cleanedImages = updates.images
        .map((i) => String(i).trim())
        .filter((i) => i.length > 0);

      validUpdates.images = cleanedImages;
    }

    req.validUpdates = validUpdates;
    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error while validating auction update",
      error: err.message,
    });
  }
};
