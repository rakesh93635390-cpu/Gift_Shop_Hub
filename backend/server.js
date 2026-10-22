const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express=require('express')
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./router/authRoutes");

const app=express()
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
connectDB();

app.use("/api/auth", authRoutes);

app.get("/",(req,res)=>{
    res.send("Gift Shop Hub backend run")
})

const PORT=process.env.PORT || 7000

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})