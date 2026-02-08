import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import http from "http";
import { Server } from "socket.io";
import socketHandler from "./socket.js";










const app = express();
const port=process.env.PORT||5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT"]
  }
});
app.set("io",io)


app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));


app.use(express.json());//jo bhi data frontend se ayega usko json me convert karna paadega nhi to data undefine batayega
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

socketHandler(io) 




 
server.listen(port, "0.0.0.0", () => {

    connectDb();

    console.log(`server started at ${port}`)
})