const mongoose= require("mongoose");
const Listing=require("../models/listing.js");
const data= require("./data.js");
main()
.then(()=>{console.log("Database connected")})
.catch(err=>{
    console.log(err)
})
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust')
}
async function init(){
    await Listing.insertMany(data)
}
init();