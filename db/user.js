// users schema file [ 01-11-2022]
const mongoose =require('mongoose')
const userSchema=mongoose.Schema({
    name:String,
    email:String,
    password:String
})
 
module.exports=mongoose.model('users',userSchema)