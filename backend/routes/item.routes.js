
import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { addItem, editItem, getItemById } from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";
import { deleteItem } from "../controllers/item.controllers.js";




const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"),addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"),editItem);

itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.get("/delete/:itemId", isAuth, deleteItem);


export default itemRouter;