import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { getCurrentUser, updateUserLocation} from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/profile", isAuth, getCurrentUser);
router.post("/update-location", isAuth, updateUserLocation)

export default router;
// ye rote chek karega token hai ya nahi

//token valid hai ya nahi

//user kaun hai