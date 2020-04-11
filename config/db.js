const mongoose=require('mongoose')
const config=require('config')
const db=config.get('mongoURI')
const func=async()=>{
    try{
        await mongoose.connect(db,{useNewUrlParser:true,useCreateIndex:true,useFindAndModify:false})
        console.log("Connecterd to database")
    }catch(err){
        console.log("Error Message"+err)
        process.exit(1)
    }
}
module.exports=func