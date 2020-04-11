const express=require('express');
const func=require('./config/db')
const app=express();
const port=process.env.PORT||5000;
//Connecting To Databases
func();
//connecting to middleware
app.use(express.json({extended:false}))
app.get("/",(req,res)=>{
    res.send("Home Page")
})
app.use('/api/users',require('./routes/api/users'))
app.use('/api/posts',require('./routes/api/post'))
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/profile',require('./routes/api/profile'))

app.listen(port,()=>{
    console.log(`server connected to ${port}`)
})