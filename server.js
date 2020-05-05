const express=require('express');
const func=require('./config/db');
const cors=require('cors')
const app=express();
const port=process.env.PORT||5000;
//Connecting To Databases
func();
//app.use(cors())
//connecting to middleware

app.use(express.json({extended:false}))
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,DELETE,PUT');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,x-auth-token');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
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