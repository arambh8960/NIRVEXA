import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";


export const addItem=async(req,res)=>{
    try{
        const {name,price,category,unitType}=req.body;
        
        if(!req.file){
            return res.status(400).json({message:"Image file is required"})
        }

        const image=await uploadOnCloudinary(req.file.path);
        if(!image){
            return res.status(500).json({message:"Failed to upload image to cloud"})
        }
        const shop=await Shop.findOne({owner:req.user._id})
        if(!shop){
            return res.status(404).json({message:"shop not found"})
        }

        const item=await Item.create({
            name,
            price,
            category,
            unitType,
            image,
            shop:shop._id
        })
        
        shop.items.push(item._id);
        await shop.save();
        (await shop.populate("owner"))
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }//edit krne pe edited wala phle dikhe
        }) // Populate so frontend can display the new item immediately
        return res.status(201).json(shop)





    }catch(error){
        console.log("Add item error:", error);
        return res.status(500).json(`add item error ${error}`)

    
    }

}

export const editItem=async(req,res)=>{
    try{
        const itemId=req.params.itemId;
        const {name,price,category,unitType}=req.body;
        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path);
        
        }
        const updateData = {
            name,
            price,
            category,
            unitType
        };
        if(image) updateData.image = image;

        const item=await Item.findByIdAndUpdate(itemId,updateData,{new:true})
        if(!item){
            return res.status(404).json({message:"item not found"})

        }
        
        const shop = await Shop.findOne({owner:req.user._id}).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }//edit krne pe edited wala phle dikhe
        })
        return res.status(200).json(shop)



    }catch(error){
        return res.status(500).json(`edit item error ${error}`)

    
    

    }

}

export const getItemById=async(req,res)=>{
    try{
        const itemId=req.params.itemId;
        const item=await Item.findById(itemId)
        if(!item){
            return res.status(404).json({message:"item not found"})
        }


        return res.status(200).json(item)



    }catch(error){
        return res.status(500).json(`get item by id error ${error}`)


    }
}
export const deleteItem=async(req,res)=>{
    try{
        const itemId=req.params.itemId;
        const item=await Item.findByIdAndDelete(itemId)
        if(!item){
            return res.status(404).json({message:"item not found"})

        }
        const shop=await Shop.findOne({owner:req.user._id})
        shop.items=shop.items.filter(item=>item.toString()!==itemId)
        await shop.save();
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)


    }catch(error){
        return res.status(500).json(`delete item error ${error}`)


    

    }

}