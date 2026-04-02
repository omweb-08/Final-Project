async function addItem(){

const name = document.getElementById("itemName").value;
const description = document.getElementById("itemDesc").value;
const price = document.getElementById("itemPrice").value;
const image = document.getElementById("itemImage").value;

if(!name || !description || !price){
alert("Please fill all fields");
return;
}

const res = await fetch("/api/items",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
description,
price,
image
})
});

const data = await res.json();

if(data.success){
alert("Product Added Successfully");

document.getElementById("itemName").value="";
document.getElementById("itemDesc").value="";
document.getElementById("itemPrice").value="";
document.getElementById("itemImage").value="";
}
else{
alert("Error adding product");
}

}