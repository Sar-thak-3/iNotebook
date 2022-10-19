const jwt = require('jsonwebtoken');
const JWT_SECRET = "Sarthaki$Chutiya";

const fetchuser = (req,res,next)=>{
    // GET the user from the jwt token and add id yp req
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticates using a valid token"});
    }
    try{
        const data = jwt.verify(token , JWT_SECRET);
        req.user = data.user;
        next();
    } catch(error){
        res.status(401).send({error: "Please authenticate using a valid token"})
    }

}

module.exports = fetchuser;