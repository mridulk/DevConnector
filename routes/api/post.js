const express=require('express')
const router=express.Router()
const {check,validationResult}=require('express-validator/check')
const auth=require('../../middleware/auth')
const User=require('../../models/user')
const Post=require('../../models/Post')
const Profile=require('../../models/Profile')
//@route POST api/posts
//@desc Create a post
//@Desc Private
router.post('/',[auth,[
    check('text','Text Is Required')
    .not()
    .isEmpty()
]],async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const user=await User.findById(req.user.id).select('-password');
        const newPost={
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
        }
        const post=new Post(newPost)
        await post.save();
        res.json(post)

    }catch(err){
        console.log(err.message)
        res.status(500).json({msg:"Server Error"})
    }
    
})
//@route GET api/posts
//@desc Get all posts
//@access Private (That means user must be authencited or logged in or have a valid token id)
router.get('/',auth,async(req,res)=>{
    try {
        const post=await Post.find().sort({date:-1})
        res.json(post)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({msg:"Server Error"})
    }
})
//@route GET api/post/:id
//@desc get post by id
//access Private
router.get('/:id',auth,async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg:'Post Not Found'})
        }
        res.json(post)
    } catch (error) {
        console.log(error.message)
        if(error.kind==='ObjectId'){
            return res.status(404).json({msg:'Post Not Found'})
        }
        res.status(500).send("Server Error")
    }
    
})
//@route api/posts/:id
//@desc delete post by id
//access Private
router.delete('/:id',auth,async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        if(post.user.toString()!==req.user.id){
            return res.status(401).json({msg:"User not authorised"})
        }
        await post.remove();
        res.json({msg:'Post Removed'})
    } catch (error) {
        console.log(error.message)
        if(error.kind==='ObjectId'){
            return res.status(404).json({msg:'Post Not Found'})
        }
        res.status(500).send("Server Error")
    }

})
//@router api/posts/like/:id
//@desc Like a Post
//@access Private
router.put('/like/:id',auth,async(req,res)=>{
    try {
    const post=await Post.findById(req.params.id)
    //Check if the post has alrady been liked
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
        return res.status(400).json({msg:"Post has already been liked"})
    }
    post.likes.unshift({user:req.user.id})
    await post.save()
    res.json(post.likes)
    } catch (error) {
        console.log(error.message)
        res.status(500).json("Server Error")
    }
    
})
//@route PUT api/posts/unlike/:id
//@desc unlike a post
//@access Private
router.put('/unlike/:id',auth,async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length==0){
        return res.status(400).json({msg:"Post has not been liked yet"})
    }
    //get remove index
    const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id)
    post.likes.splice(removeIndex,1)
    await post.save();
    res.json(post.likes)
    } catch (error) {
        console.log(error.message)
        res.status(500).json("Server Error")
    }
    
})
//@route POST api/comment/:id
//@desc e Post
//@Desc Private
router.post('/comment/:id',[auth,[
    check('text','Text Is Required')
    .not()
    .isEmpty()
]],async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const user=await User.findById(req.user.id).select('-password');
        const post=await Post.findById(req.params.id);
        const newComment={
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
        }
        // const post=new Post(newPost)
        post.comments.unshift(newComment)
        await post.save();
        res.json(post.comments)

    }catch(err){
        console.log(err.message)
        res.status(500).json({msg:"Server Error"})
    }
    
})
//@route /api/posts/comment/:id/:comment_id
//@desc Delete comment by uts ID
//@access Private
router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        //pull out the comment by comment id in the header
        const comment=post.comments.find(comment=>comment.id===req.params.comment_id)
        //Make sure that comment exists
        if(!comment){
            return res.status(404).json({msg:"Comment doesnot exist"})
        }
        //Check user
        if(comment.user.toString()!==req.user.id){
           return  res.status(401).json({msg:"User Not Authorised"})
        }
        //Get Remove Index
        const removeIndex=post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex,1);
        await post.save();
        res.json(post.comments);

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
})
module.exports=router