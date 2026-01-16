import mongoose from "mongoose";

const deliveryBoySchema=new mongoose.Schema({
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
        default:"deliveryBoy",
        required:true
    },
    resetOtp:{ type:String },
    isOtpVerified:{ type:Boolean, default:false },
    otpExpires:{ type:Date }
},{timestamps:true})

const DeliveryBoy=mongoose.model("DeliveryBoy",deliveryBoySchema);
export default DeliveryBoy;