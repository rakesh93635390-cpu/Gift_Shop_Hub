const mongoose = require("mongoose");


const OrderSchema = new mongoose.Schema({

    userID:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    products:[{
        productId:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Product"
        },
        quantity:{
            type:Number,
            default:1
        },
    }],
    totalPrice:{
        type:Number,
        default:0
    },
    orderStatus:{
        type:String,
        default:"pending"
    },
})

module.exports=mongoose.model("Order",OrderSchema)