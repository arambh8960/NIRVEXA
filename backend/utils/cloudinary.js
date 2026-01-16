import { v2 as cloudinary } from 'cloudinary'
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";


//isme image upload ho jayega auer y data backwnd ko bhenjega
const uploadOnCloudinary = async (file) => {
    cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
    try{
        const result=await cloudinary.uploader.upload(file);
         fs.unlinkSync(file);//ye file frontend se delete ho jayegi
        return result.secure_url;


    }catch(error){
        fs.unlinkSync(file);
        console.log(error);
    

    }
    
}
export default uploadOnCloudinary;