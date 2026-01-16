import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("database connected")

    }catch(error){
        console.log("db error")
    

    }

}
export default connectDb;