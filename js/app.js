const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

toggle.addEventListener("click", () => {
  nav.classList.toggle("active");
  toggle.classList.toggle("active");
});

// Menu dots toggle (click on vertical 3 dots)
const menuDots = document.querySelector(".menu-dots");
if (menuDots) {
  const dotsToggle = menuDots.querySelector(".dots-toggle");
  dotsToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    menuDots.classList.toggle("active");
  });
}

// Close menu dots when clicking outside
document.addEventListener("click", (e) => {
  if (menuDots && !menuDots.contains(e.target)) {
    menuDots.classList.remove("active");
  }
});

// Acordeón para Servicios en responsive
const dropdownLinks = document.querySelectorAll(".dropdown > a");
dropdownLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const submenu = link.nextElementSibling;
    link.classList.toggle("active");
    submenu.classList.toggle("active");
  });
});
