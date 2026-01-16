import mongoose from "mongoose";

const customerSchema=new mongoose.Schema({
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
        default:"user",
        required:true
    },
    resetOtp:{ type:String },
    isOtpVerified:{ type:Boolean, default:false },
    otpExpires:{ type:Date }
},{timestamps:true})

const Customer=mongoose.model("Customer",customerSchema);
export default Customer;