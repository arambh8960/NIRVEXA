
import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createEditShop } from "../controllers/shop.controllers.js";
import { upload } from "../middlewares/multer.js";
import { getMyShop } from "../controllers/shop.controllers.js";
import { getShopByCity } from "../controllers/shop.controllers.js";


const shopRouter = express.Router();

shopRouter.post("/create-edit", isAuth, upload.single("image"),createEditShop);
shopRouter.get("/get-my", isAuth, getMyShop);
shopRouter.get("/get-by-city/:city", isAuth, getShopByCity);



export default shopRouter;