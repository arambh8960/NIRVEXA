
import Customer from "../models/customer.model.js";
import Owner from "../models/owner.model.js";
import DeliveryBoy from "../models/delivery.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mailer.js";


const getModelByRole = (role) => {
    if (role === "owner") return Owner;
    if (role === "deliveryBoy") return DeliveryBoy;
    return Customer; 
};

const findUserByEmail = async (email) => {
    let user = await Customer.findOne({ email });
    if (user) return user;
    user = await Owner.findOne({ email });
    if (user) return user;
    user = await DeliveryBoy.findOne({ email });
    return user;
};

export const signUp=async(req,res)=>{
    try{
        const {fullName,email,password,mobile,role}=req.body;
        const Model = getModelByRole(role);
        let user = await Model.findOne({email}); 
        if(user){
            return res.status(400).json({message:"user already exist"})
    
        }
        if(!password || password.length < 6){
            return res.status(400).json({message:"password must be at least 6 characters."})
        }
        if(!mobile || mobile.length < 10){
            return res.status(400).json({message:"mobile no. must be at least 10 digits."})
        }
        const hashedPassword = await bcrypt.hash(password,10);
        user = await Model.create({
            fullName,
            email,
            password: hashedPassword,
            mobile,
            role
        })
        //token ko generate karege aur cookie mw dalenge utils folder me karenge
        const token=await genToken(user._id);
        //token ko cookies ke andar parse karna hai
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true


        })
        const userResponse = user.toObject();
        delete userResponse.password;
        return res.status(201).json(userResponse)


    }catch(error){
        console.log("Error in signup controller", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    

    }

}

export const signIn=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        let user;
        if(role){
            const Model = getModelByRole(role);
            user = await Model.findOne({email});
        }else{
            user = await findUserByEmail(email); 
        }
        if(!user){
            return res.status(400).json({message:"user does not exist"})
    
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"incorrect password"})
        }
        
       
        //token ko generate karege aur cookie mw dalenge utils folder me karenge
        const token=await genToken(user._id);
        //token ko cookies ke andar parse karna hai
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true


        })
        const userResponse = user.toObject();
        delete userResponse.password;
        return res.status(200).json(userResponse)


    }catch(error){
        console.log("Error in signin controller", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    

    }

}

export const signOut=async(req,res)=>{// jo cokie ke andar token pas kiya hai usi ko hata denge to logout ho jayenge
    try{
        res.clearCookie("token")
        return res.status(200).json({message:"log out successfully"})
        

    }catch(error){
        return res.status(500).json(`sign out error ${error}`)
    

    }



}
export const sendOtp=async(req,res)=>{
    try{
        const {email}=req.body;//data me find karega jo backend me store ho chuka hoga
        let user = await findUserByEmail(email);
        if(!user){
            return res.status(400).json({message:"user does not exist"})

        }
        const otp=Math.floor(1000+Math.random()*9000).toString();
        user.resetOtp=otp;
        user.otpExpires=Date.now()+5*60*1000;//5 minute me expiree ho jayega otp
        user.isOtpVerified=false;
        await user.save();
        await sendOtpMail(email,otp)
        return res.status(200).json({message:"otp sent successfully"})

        


    }catch(error){
        return res.status(500).json(`send otp error ${error}`)


    }
}

export const verifyOtp=async(req,res)=>{
    try{
        const {email,otp}=req.body;
        let user = await findUserByEmail(email);
        if(!user||user.resetOtp!=otp||user.otpExpires<Date.now()){
            return res.status(400).json({message:"invalid/expired otp"})

        }else{
            user.isOtpVerified=true;
            user.resetOtp=undefined;
            user.otpExpires=undefined;
            await user.save();
            return res.status(200).json({message:"otp verified successfully"})
        }
            

        }


    catch(error){
        return res.status(500).json(`verify otp error ${error}`)


    }

    
}
export const resetPassword=async(req,res)=>{
    try{
        const {email,password}=req.body;
        let user = await findUserByEmail(email);
        if(!user || !user.isOtpVerified){
            return res.status(400).json({message:"otp verification required"})

        }
        const hashedPassword = await bcrypt.hash(password,10);
        user.password=hashedPassword;
        user.isOtpVerified=false;
        await user.save();
        return res.status(200).json({message:"password reset successfully"})


    }catch(error){
        return res.status(500).json(`reset password error ${error}`)


    }
}

export const googleAuth = async (req, res) => {
    try {
        const { email, fullName, role, mobile, isSignUp } = req.body;
        
        // If role is provided, check that specific model, otherwise search all
        let user;
        let Model;
        if (role) {
            Model = getModelByRole(role);
            user = await Model.findOne({ email });
        } else {
            user = await findUserByEmail(email);
        }

        if (user && isSignUp) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (!user && !isSignUp) {
            return res.status(400).json({ message: "Enter correct email" });
        }

        if (!user) {
            // If creating a new user, use the role provided to select the model
            // Create new user if they don't exist
            user = await Model.create({
                fullName,
                email,
                role: role || "user",
                mobile
            });
        } else {
            // If user exists, update the mobile number if provided
            if (mobile) {
                user.mobile = mobile;
                await user.save();
            }
        }

        // Generate Token
        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        const userResponse = user.toObject();
        delete userResponse.password;
        return res.status(200).json(userResponse);
    } catch (error) {
        console.log("Error in googleAuth controller", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
