const express=require('express')
const gravatar=require('gravatar')
const router=express.Router()
const config=require('config')
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs')
const User=require('../../models/user')
const {check,validationResult}=require('express-validator/check')
router.post('/',[
    check('name','Name is Required').not().isEmpty(),
    check('email','Enter a valid email').isEmail(),
    check('password','Minimum length must be of 6 characters').isLength({min:6})
],async(req,res)=>{
    //console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const{name,email,password}=req.body
    try{
        //see if user exists
        let user=await User.findOne({name});
        if (user) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'User already exists' }] });
          }


        //get user gravatar
        const avatar=gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm' //default image
        })
        user=new User({
            name,
            email,
            password,
            avatar
        })
        //encrypt the password
        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(password,salt);
        await user.save();
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


//return json web token
module.exports=router