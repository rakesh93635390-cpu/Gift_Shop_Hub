const express=require('express')
require("dotenv").config();
const app=express()

app.get("/",(req,res)=>{
    res.send("Gift Shop Hub backend run")
})

const PORT=process.env.PORT || 7000

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})