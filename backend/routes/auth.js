const express = require("express");
const router = express.Router();
const {body , validationResult} = require('express-validator');
const User = require('../models/User');

// Create a user using: POST "/api/auth/createuser" -> Dosen't require Auth

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
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({error: "User with this email already exists"})
    }
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    })
    .then(user => res.json(user)).catch((err)=>{
        console.log(err);
        res.status(500).json({ message: err.message})
    })
})

module.exports = router