console.log("hello world");
console.log("");
var product = [
    {name:"apple", count: 5, price: 70},
    {name:"orange", count: 10, price: 90}
]

var AllPrice = 0;

for (var i = 0; i < product.length; i++) 
{
    console.log(product[i].name + " " + product[i].count + " " + product[i].price);

    AllPrice += product[i].count * product[i].price;
}

console.log("Общая стоимость всех товаров: " + AllPrice);

var OtherObject = {
    bill: product,
    result: AllPrice
}

console.log(JSON.stringify(OtherObject));

AllPrice = 0;
product.forEach ((element) =>
{
    AllPrice += element.price * element.count;
});

console.log(AllPrice);

console.log(new Date().getDate().toString() + " " + new Date().getHours().toString());

// 2 часть

    var menuItems = 
    [
      { text: "Главная" , href: "#home" },
      { text: "Каталог" , href: "#catalog" },
      { text: "О нас"   , href: "#about" },
      { text: "Контакты", href: "#contacts" }
    ];

    var nav = document.createElement("nav_test");
    var ul  = document.createElement("ul_test");
    ul.className = "menu_test";

    menuItems.forEach((item) => 
    {
      var li = document.createElement("li");
      var a = document.createElement("a");

      a.textContent = item.text;
      a.href = item.href;

      li.append(a);
      ul.append(li);
    });

    nav.append(ul);

    var paragraph = document.createElement("p");
    paragraph.textContent = "js генерация";
    document.body.append(nav, paragraph);

    var button = document.createElement("button");
    button.textContent = "Скопировать пункты меню в абзац";
    document.body.append(nav, button);


    button.addEventListener("click", () => 
    {
    var listItems = document.querySelectorAll(".menu_test li");

    var menuText = Array.from(listItems).map((li) => li.textContent.trim()).join(", ");
    paragraph.textContent += " " + menuText;

    });


    var styleButton = document.createElement("button");
    styleButton.textContent = "изменить  стиль";
    document.body.append(nav, styleButton);


styleButton.addEventListener("click", () => {

    var elements = document.querySelectorAll(".menu_test");
    
    elements.forEach((el) => 
    {
      el.style.color = "crimson";
      el.style.fontWeight = "bold";
      el.style.backgroundColor = "#e92020";
    });

});


var searchInput = document.createElement("input");
 document.body.append(nav, searchInput);



searchInput.addEventListener("input", () => {
    
    var query = searchInput.value.trim().toLowerCase();
    var links = document.querySelectorAll(".menu_test li a");

    links.forEach((link) => 
    {
        var originalText = link.textContent;
        var lowerText = originalText.toLowerCase();


        if (query === "") 
            {
            link.innerHTML = originalText;
            link.parentElement.style.backgroundColor = "";
            return;
            }

        if (lowerText.includes(query)) 
        {
            link.parentElement.style.backgroundColor = "#f8feaa";

            var startIndex = lowerText.indexOf(query);
            var endIndex = startIndex + query.length;
        
            var before = originalText.slice(0, startIndex);
            var match = originalText.slice(startIndex, endIndex);
            var after = originalText.slice(endIndex);

            link.innerHTML = `${before}<mark>${match}</mark>${after}`;
        } 
        else 
        {
            link.innerHTML = originalText;
            link.parentElement.style.backgroundColor = "#ffffff";
        }
    });
});

