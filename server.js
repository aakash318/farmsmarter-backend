require("dotenv").config();
const express = require("express");

const db = require("./db");
const cors = require("cors");


const upload = require("./multer");



const app = express();


app.use(
  cors({
    origin: [
      "https://truckimex.shop",
      "https://www.truckimex.shop",
      "http://localhost:5173"
    ],
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
const paymentRoute=require('./paymentRoute');
app.use('/payment',paymentRoute)

const PORT = process.env.PORT || 5000;
app.post("/register",(req,res)=>{
 const {
name,
email,
password,
phoneNumber,
farmLocation
}=req.body;
db.query("SELECT email FROM registerfarmer WHERE email=?",[email],(err,result)=>{
  if(err){
    return res.json({msg:"error",error:err});
    
  }
  if(result.length>0){
    return res.json({msg:"you are already register"});
  }
  if(result.length==0){
    const sql="INSERT INTO registerfarmer(name,email,password,phoneNumber,farmLocation) values(?,?,?,?,?)";
db.query(sql,[name,email,password,phoneNumber,farmLocation],(err,result)=>{
  if(err){
    console.log(err,"farmers not registered")
    return res.json({msg:"farmer not registered"})
  }
  if(result){

   res.send("data inserted succesfully")
  }
})
  }
})

})
app.post("/login",(req,res)=>{

const {email,password}=req.body;

const sql=
"SELECT * FROM registerfarmer WHERE email=? AND password=?";

db.query(sql,[email,password],(err,result)=>{

if(err){

console.log(err);

return res.status(500).json({
success:false,
msg:"login failed"
});

}

if(result.length>0){

return res.json({

success:true,
msg:"login successful",
user:result[0]

});

}

return res.status(401).json({

success:false,
msg:"Email or password mismatch"

});

});

});
app.post(
"/addProduct",
upload.single("image"),
(req,res)=>{

const {
productName,
price,
quantity,
description
}=req.body;

console.log(req.body);

console.log(req.file);

const image=req.file.filename;

const sql=
"INSERT INTO addproducts(productName,price,quantity,description,image) VALUES(?,?,?,?,?)";

db.query(
sql,
[
productName,
price,
quantity,
description,
image
],
(err,result)=>{

if(err){

console.log(err);

return res.status(500).json({
msg:"failed"
});

}

res.json({
msg:"product added"
});

});

});
app.get("/products",(req,res)=>{

const sql="SELECT * FROM addproducts";

db.query(sql,(err,result)=>{

if(err){

return res.status(500).json({
msg:"Error fetching products"
});

}

res.json(result);

});

});
app.get("/product/:id",(req,res)=>{

const {id}=req.params;

const sql=
"SELECT * FROM addproducts WHERE id=?";

db.query(
sql,
[id],
(err,result)=>{

if(err){

return res.status(500).json({
msg:"Error fetching product"
});

}

if(result.length>0){

return res.json(
result[0]
);

}

return res.status(404).json({
msg:"Product not found"
});

});

}); 
app.delete(
"/deleteProduct/:id",
(req,res)=>{

const {id}=req.params;

const sql=
"DELETE FROM addproducts WHERE id=?";

db.query(
sql,
[id],
(err,result)=>{

if(err){

return res
.status(500)
.json({
msg:"Delete failed"
});

}

res.json({
msg:"Deleted successfully"
});

});

});
app.delete("/cart/:id",(req,res)=>{
  const{id}=req.params;
  const sql="DELETE FROM cart WHERE id=?";
  db.query(sql,[id],(err,result)=>{
    if(err){
      return res.json({msg:"item not delet"})
    }
    if(result){
      res.json({msg:"item deleted from cart"})
    }
  })
})
app.post("/cart",(req,res)=>{

const {
user_id,
product_id,
quantity
}=req.body;

const sql=
"INSERT INTO cart(user_id,product_id,quantity) VALUES(?,?,?)";

db.query(
sql,
[
user_id,
product_id,
quantity
],
(err,result)=>{

if(err){

console.log(err);

return res.status(500).json({
msg:"Cart failed"
});

}

res.json({
msg:"Added to cart successfully"
});

});

});
app.get("/cart/:userId",(req,res)=>{

const {userId}=req.params;

const sql = `

SELECT
cart.id,
addproducts.productName,
addproducts.price,
addproducts.image,
cart.quantity

FROM cart

JOIN addproducts

ON cart.product_id=addproducts.id

WHERE cart.user_id=?

`;

db.query(
sql,
[userId],
(err,result)=>{

if(err){

console.log(err);

return res.status(500).json({
msg:"Error fetching cart"
});

}

res.json(result);

});

});
app.post("/payment/success",(req,res)=>{

const{
razorpay_payment_id,
razorpay_order_id
}=req.body;

const sql=
"INSERT INTO orders(payment_id,order_id,status) VALUES(?,?,?)";

db.query(
sql,
[
razorpay_payment_id,
razorpay_order_id,
"success"
],
(err,result)=>{

if(err){

return res.status(500).json({
msg:"failed"
});

}

res.json({
msg:"order saved"
});

});

});
// delete all cart products

app.delete("/cart/clear/:userId",(req,res)=>{

const userId=req.params.userId;

db.query(
"DELETE FROM cart WHERE user_id=?",
[userId],
(err,result)=>{

if(err){

return res.status(500).json(err);

}

res.json({
message:"cart cleared"
});

});

});

app.get("/", (req, res) => {
  res.send("app is running");
});
app.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});