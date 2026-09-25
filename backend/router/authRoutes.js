const express=require('express');
const bcrypt=require('bcrypt')
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router=express.Router();

// Register User
router.post('/register',async(req,res)=>{

    const {name,email,password}=req.body;
    try{
        const existingUser = await User.findOne({ email });
        if (existingUser)
     {
         return res.status(400).json({message:'User already exists'});
     }    
     const hashedPassword = await bcrypt.hash(password, 10);

     const user = await User.create({
              name,
              email,
              password: hashedPassword
        });

        // jwt token generation
        const token = jwt.sign(
       { userId: user._id },
       process.env.JWT_SECRET,
      { expiresIn: "1d" }
     );

     res.status(201).json({
     message: "User registered successfully",
     token: token
   }); 
    }
    catch(error){
        res.status(500).json({message:'Error registering user'});
    }
});

// Login User

router.post('/login',async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user =await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'Invalid email or password'});
        }
        const ispasswordValid = await bcrypt.compare(password,user.password);

         if(!ispasswordValid){
            return res.status(400).json({message : 'Not correct password'});
        }
        // jwt togen verification
        const token = jwt.sign(
         { userId: user._id },
           process.env.JWT_SECRET,
        { expiresIn: "1d" }
        )
      res.status(200).json({
   message: "User Logged in successfully",
   token: token
  });
        
    }

    catch(error){
        res.status(500).json({message : 'Error logging in user or server error'})
    }
})

router.get('/profile', authMiddleware, async (req, res) => {
res.status(200).json({message:'User profile accessed successfully',userId:req.userId})
});

module.exports=router;
