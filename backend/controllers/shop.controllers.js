import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";


export const createEditShop=async(req,res)=>{

    try{
        const {name,address,city,state}=req.body;
        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path);
        
        }
        let shop=await Shop.findOne({owner:req.user._id})
        if(!shop){

         shop=await Shop.create({
            name,
            address,
            city,
            state,
            image,
            owner:req.user._id
     
    }) 
}else{
    shop=await Shop.findOneAndUpdate({owner:req.user._id},{
        name,
        address,
        city,
        state,
        image,
        owner:req.user._id
    },{new:true})
}

    await shop.populate(["owner", "items"])
    return res.status(201).json(shop)
    
}catch(error){
    return res.status(500).json(`create shop error ${error}`)

    }

}

export const getMyShop=async(req,res)=>{
    try{
        const shop=await Shop.findOne({owner:req.user._id}).populate("owner").populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }})
        if(!shop){
            return res.status(200).json(null)
        }
        return res.status(200).json(shop)


    }catch(error){
        return res.status(500).json(`get my shop error ${error}`)


    }
}

export const getShopByCity=async(req,res)=>{
    try{
        const{city}=req.params;
        const shops=await Shop.find({
            city:{$regex:new RegExp(city,"i")}
        }).populate("items")
        if(!shops){
            return res.status(404).json({message:"shops not found"})

        }else{
            return res.status(200).json(shops)
        }

    }catch(error){
        return res.status(500).json(`get shop by city error ${error}`)


    }
}
