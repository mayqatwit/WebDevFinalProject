function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show");
}
document.addEventListener("click", function (event) {
    const sidebar = document.getElementById("sidebar");
    const button = document.getElementById("toggleButton");
    const searchToggle = document.getElementById("searchToggle");

    if ((!sidebar.contains(event.target) && !button.contains(event.target)) || searchToggle.contains(event.target)) {
        sidebar.classList.remove("show");
    }
});
function toggleSearch() {
    const searchInput = document.getElementById('search');
    searchInput.classList.toggle('show');
    if (searchInput.classList.contains('show')) {
        searchInput.focus();
    }
}
function searchCookbooks() {
    const input = document.getElementById("search").value.toLowerCase();
    const cookbooks = document.querySelectorAll(".cookbook");

    cookbooks.forEach(cookbook => {
        const title = cookbook.querySelector("h3").textContent.toLowerCase();
        if (title.includes(input)) {
            cookbook.style.display = "block";
        } else {
            cookbook.style.display = "none";
        }
    });
}