const express=require("express");
const Razorpay=require("razorpay");

const router=express.Router();

const razorpay=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET
});

router.post("/create-order",async(req,res)=>{

try{

const {amount}=req.body;

const options={

amount:amount*100, // rupees → paise
currency:"INR",

receipt:"receipt_"+Date.now()

};

const order=await razorpay.orders.create(options);

res.json({

success:true,
order

});

}

catch(err){

console.log(err);

res.status(500).json({

success:false,
error:err.message,
message:"Order creation failed",
fullerror:err


});

}

});

module.exports=router;