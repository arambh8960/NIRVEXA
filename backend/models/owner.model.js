import mongoose from "mongoose";

const ownerSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
    },
    mobile:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:"owner",
        required:true
    },
    resetOtp:{ type:String },
    isOtpVerified:{ type:Boolean, default:false },
    otpExpires:{ type:Date }
},{timestamps:true})

const Owner=mongoose.model("Owner",ownerSchema);
export default Owner;