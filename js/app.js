const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

toggle.addEventListener("click", () => {
  nav.classList.toggle("active");
  toggle.classList.toggle("active");
});

const menuDots = document.querySelector(".menu-dots");
if (menuDots) {
  const dotsToggle = menuDots.querySelector(".dots-toggle");
  dotsToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    menuDots.classList.toggle("active");
  });
}

document.addEventListener("click", (e) => {
  if (menuDots && !menuDots.contains(e.target)) {
    menuDots.classList.remove("active");
  }
});

const dropdownLinks = document.querySelectorAll(".dropdown > a");
dropdownLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const submenu = link.nextElementSibling;
    link.classList.toggle("active");
    submenu.classList.toggle("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const model = new PropertyModel(CONFIG);
  const view = new PropertyView("properties-container");
  const paginationView = new PaginationView("pagination-container");
  const controller = new PropertyController(model, view, paginationView);
  controller.init();
});
