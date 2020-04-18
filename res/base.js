
"use strict";

/**
* add an empty span.menu to nav 
* that toggle nav.expanded on click
**/
document.addEventListener( "DOMContentLoaded", function() {

  var nav  = document.querySelector("nav");
  var menu = document.createElement("span");
  menu.classList.add("menu");
  nav.insertBefore(menu, nav.firstChild);
  menu.addEventListener("click", function() { document.querySelector("nav").classList.toggle("expanded"); });   

  var lorem = document.querySelectorAll(".lorem-ipsum");
  var n=0;
  while( lorem[n] ) {
    lorem[n].innerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam et leo vulputate, porta nibh quis, rhoncus nisl. Morbi molestie quam mauris, et gravida velit tincidunt eget. Maecenas eget auctor ligula, et luctus nisl. Curabitur blandit dolor ac luctus tempor. Suspendisse et molestie mi. Nulla eu enim sit amet mi condimentum ullamcorper sed a ex. Vivamus tristique pulvinar eros, quis aliquet justo vulputate eu. Suspendisse sollicitudin pretium odio at dapibus. Phasellus eget erat ac nunc porta bibendum. Nunc sed dolor leo. Aliquam et justo enim. Sed pharetra vehicula odio nec gravida. Integer a lorem quis lorem imperdiet scelerisque. Nunc ac tellus vestibulum, bibendum diam venenatis, consequat nulla. Cras quis venenatis nisi.";
    n++;
  }


} );

