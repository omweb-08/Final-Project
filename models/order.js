const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

customerName:{
type:String,
required:true
},

customerEmail:{
type:String,
required:true
},

customerPhone:{
type:String,
required:true
},

itemName:{
type:String,
required:true
},

quantity:{
type:Number,
default:1
},

feedback:{
type:String,
default:"Order from cart"
}

});

module.exports = mongoose.model("Order",orderSchema);