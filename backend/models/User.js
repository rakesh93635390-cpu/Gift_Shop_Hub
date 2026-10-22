const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
 name: {
  type: String
},
email:{
    type:String
},
password:{
    type:String
},
role:{
    type:String,
    default:"user"
},
status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
}

})

module.exports=mongoose.model("User",UserSchema)