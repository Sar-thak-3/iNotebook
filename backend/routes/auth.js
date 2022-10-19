const express = require("express");
const router = express.Router();
const {body , validationResult} = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

// JWT ek bhut secure connection authenticate krata hai JWT . Jb koi user login krta hai to ek JWT token generate hota hai or vo jb tk verify ni hoga tb tk login nhi hoga!
const JWT_SECRET = "Sarthaki$Chutiya"

const fetcuser = require('../middleware/fetchuser');
const fetchuser = require("../middleware/fetchuser");

// ROUTE: 1 Create a user using: POST "/api/auth/createuser" -> Dosen't require Auth

router.post('/createuser' , [
    body('name' , "Enter a valid name").isLength({min: 3}),
    body('email').isEmail(),
    body('password').isLength({min: 5})
] ,async (req,res)=>{
    // If there are errors return bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    
    // Check whether user with this email exists already
    // let user = await User.findOne({email: req.body.email});
    // if(user){
    //     return res.status(400).json({error: "User with this email already exists"})
    // }

    // const salt = await bcrypt.genSalt(10);
    // // It return a Promise , hence await is used!
    // secPass = await bcrypt.hash(req.body.password , salt);

    // user = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: secPass,
    // })
    // .then(user => res.json(user)).catch((err)=>{
    //     console.log(err);
    //     res.status(500).json({ message: err.message})
    // })
    try {
        let user = await User.findOne({email: req.body.email});
        if(user){
            return res.status(400).json({error: "User with this email already exists"})
        }

        const salt = await bcrypt.genSalt(10);
        // It return a Promise , hence await is used!
        secPass = await bcrypt.hash(req.body.password , salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        
        const data = {
            id: user.id,
        }
        const authToken = jwt.sign(data , JWT_SECRET);
        console.log(authToken);
        res.json({token: authToken});

    } catch(error){
        console.error(error.message);
        res.status(500).send("Some error occured");
    };
})

// ROUTE 2: Create a user using: POST "/api/auth/login" -> Dosen't require Auth
router.post('/login' , [
    body('email' , "Enter a valid email").isEmail(),
    body('password').exists()
] , async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email,password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: "Wrong credentialss" , use: user})
        }
        const passwordComapare = await bcrypt.compare(password , user.password);
        if(!passwordComapare){
            return res.status(400).json({error: "Wrong credentials" , com: passwordComapare})
        }
        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data , JWT_SECRET);
        res.json({authtoken});
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("Some error occured");
    }

})

// ROUTE 3: Get loggedin User Details using "/api/auth/getuser". Login required
router.post('/getuser', fetchuser ,async (req,res)=>{

    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router
