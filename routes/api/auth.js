const express=require('express')
const router=express.Router()
const User=require('../../models/user')
const auth=require('../../middleware/auth')
const bcrypt=require('bcryptjs')
const config=require('config')
const jwt=require('jsonwebtoken');
const {check,validationResult}=require('express-validator/check')
router.get('/',auth,async(req,res)=>{
    
    try{
        const user=await User.findById(req.user.id).select('-password')
        res.send(user)
    }catch(arr){
        res.status(500).json({msg:err.message})
    }
})
//@route api/auth
//@desc authenticate user and get token(Login user) 
router.post('/',[
    //check('name','Name is Required').not().isEmpty(),
    check('email','Enter a valid email').isEmail(),
    check('password','Password is required').exists()
],async(req,res)=>{
    //console.log(req.body);
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({errors:errors.array()})
    }
    const{email,password}=req.body
    try{
        //see if user exists
        let user = await User.findOne({ email });

        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        //json webtoken ,putting user id into token ,algo used:sh256
        const payload={
            user:{
                id:user.id
            }
        }
        jwt.sign(payload,
            config.get('jsonToken'),{expiresIn:36000000},(error,token)=>{
                if(error)throw error;
                res.json({token})
            })
        // res.send("User Registered")
    }
    catch(err){
        res.status(500).send("server error")
    }
    
})

module.exports=router
