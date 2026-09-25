const mongoose = require("mongoose");


const ProductSchema=new mongoose.Schema({
    productName:{
        type:String
    },
    productPrice:{
        type:Number
    },
    productDescription:{
        type:String
    },
    ProductImage:{
        type:String
    },
    productCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "Category"
    },
    productShop:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "Shop"
    },
    productOwner:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    productStock:{
        type:Number
    },
    
})

module.exports=mongoose.model("Product",ProductSchema)