const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req,res,next)=>{

    try{
 const token = req.header("Authorization")?.split(" ")[1];
     
    if(!token){
        return res.status(401).json({message:'No token provided'})
    }

    const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
);
    req.userId= decoded.userId;
    const user = await User.findById( req.userId);
    if(!user){
        return res.status(401).json({message:'User not found'})
    }
    next();
    }
catch(error) {
   return res.status(401).json({
      message: "Invalid or expired token"
   });
}
   
}

module.exports=authMiddleware;