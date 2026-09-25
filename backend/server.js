const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express=require('express')
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./router/authRoutes");

const app=express()
app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);

app.get("/",(req,res)=>{
    res.send("Gift Shop Hub backend run")
})

const PORT=process.env.PORT || 7000

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})