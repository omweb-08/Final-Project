// CART STORAGE
function getCart(){
return JSON.parse(localStorage.getItem("cart")) || [];
}


// ADD TO CART
function addToCart(name,price){

let cart = getCart();

const existing = cart.find(item => item.name === name);

if(existing){
existing.quantity += 1;
}else{
cart.push({
name:name,
price:price,
quantity:1
});
}

localStorage.setItem("cart",JSON.stringify(cart));

updateCartCount();

alert(name + " added to cart");

}


// UPDATE CART COUNT
function updateCartCount(){

let cart = getCart();

let count = cart.reduce((total,item)=> total + item.quantity ,0);

const cartCount = document.getElementById("cart-count");

if(cartCount){
cartCount.innerText = count;
}

}


// PAGE LOAD
document.addEventListener("DOMContentLoaded",()=>{

updateCartCount();

});