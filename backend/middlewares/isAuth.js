import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";
import Owner from "../models/owner.model.js";
import DeliveryBoy from "../models/delivery.model.js";
import dotenv from "dotenv";

dotenv.config();

export const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        // Check all models to find the user
        let user = await Customer.findById(decoded.userId).select("-password");
        if (!user) {
            user = await Owner.findById(decoded.userId).select("-password");
        }
        if (!user) {
            user = await DeliveryBoy.findById(decoded.userId).select("-password");
        }

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in isAuth middleware", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};