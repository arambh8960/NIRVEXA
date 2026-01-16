import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { getUserProfile } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/profile", isAuth, getUserProfile);

export default router;
// ye rote chek karega token hai ya nahi

//token valid hai ya nahi

//user kaun hai