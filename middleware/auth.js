const jwt=require('jsonwebtoken')
const express=require('express')
const config=require('config')
module.exports=(req,res,next)=>{
    //get token from the header route
    const token=req.header('x-auth-token');
    if(!token){
        return res.status(401).json({msg:'No Token,Unauthorised Access'});
    }
    
    //Verify Token
    try{
        const decode=jwt.verify(token,config.get('jsonToken'))
        req.user=decode.user;
        next()
    }catch(err){
        res.status(401).json({mas:'Token Is Not Valid'})
    }
    
}