
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");

  if (!sidebar) return;

  const menuButton = document.createElement("button");

  menuButton.type = "button";
  menuButton.className = "mobile-menu-btn";
  menuButton.textContent = "☰ Menu";
  menuButton.setAttribute("aria-expanded", "false");

  document.body.appendChild(menuButton);

  menuButton.addEventListener("click", function () {
    const opened = sidebar.classList.toggle("sidebar-open");

    menuButton.setAttribute(
      "aria-expanded",
      String(opened)
    );
  });

  sidebar.querySelectorAll("nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      sidebar.classList.remove("sidebar-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
});
