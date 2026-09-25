const mongoose = require("mongoose");


const CartSchema = new mongoose.Schema({
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
    products:[{
        productId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Product"
},
        quantity:{
            type:Number,
            default:1
        }
    }],
    ordered:{
        type:Boolean,
       default:false
    },

})

module.exports=mongoose.model("Cart",CartSchema)