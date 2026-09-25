const mongoose = require("mongoose");

const ShopSchema=new mongoose.Schema({

    shopName:{
        type:String
    },
    shopAddress:{
        type:String
    },
    shopContact:{
        type:Number
    },
    shopEmail:{
    type:String
    },
    shopDescription:{
        type:String
    },
    shopImage:{
        type:String
    },
    shopOwner:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})

module.exports=mongoose.model("Shop",ShopSchema)

