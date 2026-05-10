const mongoose= require("mongoose");
const schema= new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image:{
        type:String,
        default:"nature.me",
        set:(v)=>{
            return v===""?"uhanjani.me":v;
        },
        },
    price:{
        type:Number,
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },
});
const Listing= mongoose.model("Listing", schema);
module.exports=Listing;
