require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const nodemailer = require("nodemailer");

const Contact = require('./models/contact');
const Order = require('./models/order');
const Item = require('./models/item');
const Cart = require('./models/cart');

const app = express();
const PORT = process.env.PORT || 5018;


// ================= ENV =================
const {
MONGODB_URI,
ADMIN_USER = "admin",
ADMIN_PASS = "adminpass",
SESSION_SECRET = "secret"
} = process.env;


// ================= EMAIL =================
const transporter = nodemailer.createTransport({
host: "smtp.gmail.com",
port: 587,
secure: false,
auth: {
user: "fabritech.workshop08@gmail.com",
pass: "zknznrrwgcuvaxke"
},
tls:{
rejectUnauthorized:false
}
});

transporter.verify((error)=>{
if(error){
console.log("❌ Email Login Failed:", error.message);
}else{
console.log("✅ Email Server Ready!");
}
});


// ================= MIDDLEWARE =================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
secret:SESSION_SECRET,
resave:false,
saveUninitialized:false
}));

app.use(express.static(path.join(__dirname,"public")));


// ================= DATABASE =================
mongoose.connect(MONGODB_URI || "mongodb://127.0.0.1:27017/CO6k")
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log("❌ MongoDB Error:",err.message));


// ================= CONTACT FORM =================
app.post("/api/contact",async(req,res)=>{

try{

const {name,phone,email,message}=req.body;

if(!name || !phone || !email || !message)
return res.status(400).json({success:false});

const contact=new Contact({name,phone,email,message});

await contact.save();

await transporter.sendMail({
from: `"${name}" <fabritech.workshop08@gmail.com>`,
to: "fabritech.workshop08@gmail.com",
replyTo: email,
subject: "New Contact Inquiry",
text: `
Customer Name: ${name}
Customer Email: ${email}
Customer Phone: ${phone}

Message:
${message}
`
});

res.json({success:true});

}catch(err){
console.error(err);
res.status(500).json({success:false});
}

});


// ================= GET ALL CONTACTS =================
app.get("/api/contact",async(req,res)=>{

try{

const contacts = await Contact.find().sort({createdAt:-1});
res.json(contacts);

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});


// ================= ADMIN REPLY =================
app.put("/api/inquiries/reply/:id",async(req,res)=>{

try{

const {reply} = req.body;
const inquiry = await Contact.findById(req.params.id);

if(!inquiry)
return res.status(404).json({message:"Inquiry not found"});

inquiry.reply = reply;

await inquiry.save();

await transporter.sendMail({

from:"FabriTech Support <fabritech.workshop08@gmail.com>",
to: inquiry.email,

subject:"Reply to your inquiry - FabriTech",

text:`
Hello ${inquiry.name},

You asked:
${inquiry.message}

Admin Reply:
${reply}

Thank you,
FabriTech Team
For further assistance, call on 9373632848 / 9860997372
`
});

res.json({success:true});

}catch(err){

console.log(err);
res.status(500).json({message:"Server error"});

}

});


// ================= DELETE INQUIRY =================
app.delete("/api/inquiries/:id",async(req,res)=>{

try{

await Contact.findByIdAndDelete(req.params.id);
res.json({success:true});

}catch(err){

console.log(err);
res.status(500).json({success:false});

}

});


// ================= ADMIN LOGIN =================
app.post("/api/admin/login",(req,res)=>{

const {username,password}=req.body;

if(username===ADMIN_USER && password===ADMIN_PASS){
req.session.isAdmin=true;
return res.json({success:true});
}

res.status(401).json({success:false});

});


// ================= ITEMS =================
app.get("/api/items",async(req,res)=>{
try{
const items=await Item.find();
res.json({success:true,items});
}catch(err){
res.status(500).json({success:false});
}
});


app.post("/api/items",async(req,res)=>{

if(!req.session.isAdmin)
return res.status(401).json({success:false});

try{

const {name,description,price,image}=req.body;

const item=new Item({name,description,price,image});

await item.save();

res.json({success:true,item});

}catch(err){
res.status(500).json({success:false});
}

});


// ================= ORDER API =================
app.post("/api/order", async (req,res)=>{

try{

let {items,customerName,customerEmail,customerPhone} = req.body;

if(!items) items=[];
if(!Array.isArray(items)){
items=[items];
}


// VALIDATION
if(customerName.length < 3){
return res.status(400).json({message:"Name must be at least 3 characters"});
}

if(!/^[0-9]{10}$/.test(customerPhone)){
return res.status(400).json({message:"Phone must be 10 digits"});
}

if(!/^[a-zA-Z0-9._%+-]{3,}@gmail.com$/.test(customerEmail)){
return res.status(400).json({message:"Invalid Gmail address"});
}

let orderText="";

for(const item of items){

if(!item.name) continue;

const order = new Order({

customerName,
customerEmail,
customerPhone,
itemName:item.name,
quantity:item.quantity || 1,
feedback:"Order from cart",
createdAt:new Date()

});

await order.save();

orderText += `
Item name: ${item.name}
Quantity: ${item.quantity}
`;

}


// ⭐ EMAIL SENT TO ADMIN BUT REPLY GOES TO CUSTOMER
await transporter.sendMail({
  from: `"${customerName}" <fabritech.workshop08@gmail.com>`,
  
  to: "fabritech.workshop08@gmail.com",
  
  replyTo: customerEmail,
  
  subject: "New Order Received - FabriTech",
  
  text: `
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Customer Phone: ${customerPhone}

Ordered Items:
${orderText}

For further assistance, call on 9373632848 / 9860997372
  `
});

res.json({success:true,message:"Order placed successfully"});

}catch(err){

console.log(err);
res.status(500).send("Error placing order");

}

});


// ================= VIEW ORDERS =================
app.get("/api/orders",async(req,res)=>{

try{

const orders = await Order.find().sort({createdAt:-1});
res.json({success:true,orders});

}catch(err){

console.log(err);
res.status(500).json({success:false});

}

});


// ================= CART =================
app.post("/api/cart",async(req,res)=>{

try{

const {userEmail,itemId,quantity=1}=req.body;

let cart=await Cart.findOne({userEmail});

if(!cart){
cart=new Cart({
userEmail,
items:[]
});
}

const existing=cart.items.find(
i=>i.itemId.toString()===itemId
);

if(existing){
existing.quantity+=quantity;
}else{
cart.items.push({itemId,quantity});
}

await cart.save();

res.json({success:true,cart});

}catch(err){
res.status(500).json({success:false});
}

});


app.get("/api/cart/:userEmail",async(req,res)=>{

try{

const cart=await Cart.findOne({
userEmail:req.params.userEmail
}).populate("items.itemId");

res.json({success:true,cart});

}catch(err){
res.status(500).json({success:false});
}

});


// ================= SPA =================
app.get("*",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"));
});


// ================= START SERVER =================
app.listen(PORT,()=>{
console.log(`🚀 Server running at http://localhost:${PORT}`);
});

 