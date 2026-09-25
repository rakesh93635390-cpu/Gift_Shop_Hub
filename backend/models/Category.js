const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    categoryName : {
        type : String
    },
    categoryImage : {
        type : String
    },
    categoryDescription : {
        type : String
    },
    categoryStatus : {
        type : String
    },
})
module.exports = mongoose.model("Category",CategorySchema)