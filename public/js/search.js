
// LIST OF WEBSITE PAGES
const pages = [
  { name: "home", url: "index.html" },
  { name: "services", url: "services.html" },
  { name: "about", url: "about.html" },
  { name: "contact", url: "contact.html" },
  { name: "admin", url: "admin.html" },
  { name: "customer", url: "customer.html" },
  { name: "shutters", url: "shutters.html" },
  { name: "products", url: "products.html" },
  { name: "product", url: "products.html" },
  { name: "cart", url: "cart.html" }
];

// SHOW SEARCH SUGGESTIONS

function showSuggestions() {

  let input = document.getElementById("searchInput").value.toLowerCase().trim();
  let suggestionBox = document.getElementById("suggestions");

  suggestionBox.innerHTML = "";

  if (input === "") {
    suggestionBox.classList.add("hidden");
    return;
  }

  let filtered = pages.filter(page =>
    page.name.includes(input)
  );

  filtered.forEach(page => {

    let li = document.createElement("li");

    li.textContent = page.name;

    li.className = "px-3 py-2 hover:bg-blue-100 cursor-pointer";

    li.onclick = function () {
      window.location.href = page.url;
    };

    suggestionBox.appendChild(li);

  });

  suggestionBox.classList.remove("hidden");

}



// ENTER KEY SEARCH

document.addEventListener("DOMContentLoaded", function () {

  const input = document.getElementById("searchInput");

  input.addEventListener("keypress", function(e){

    if(e.key === "Enter"){

      e.preventDefault();

      let value = this.value.toLowerCase().trim();

      const found = pages.find(page =>
        page.name.includes(value)
      );

      if(found){

        window.location.href = found.url;

      } else {

        alert("Page not found");

      }

    }

  });

});

