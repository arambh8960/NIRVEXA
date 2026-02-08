import User from "../models/user.model.js";

/* ================= GET CURRENT USER ================= */
export const getCurrentUser = async (req, res) => {
  try {
    // isAuth middleware ne req.user set kar diya hoga
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({
      message: "Get current user error",
      error: error.message
    });
  }
};

/* ================= UPDATE USER LOCATION ================= */
export const updateUserLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)]
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Location updated" });
  } catch (error) {
    return res.status(500).json({
      message: "Update location error",
      error: error.message
    });
  }
};
