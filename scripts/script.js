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
async function loadCookbooks() {
    const response = await fetch('http://localhost:3000/cookbooks');
    const cookbooks = await response.json();

    const container = document.querySelector(".cookbookContainer .flex-container");
    container.innerHTML = "";

    cookbooks.forEach(cookbook => {
        const section = document.createElement("section");
        section.className = "cookbook";
        section.onclick = () => location.href = `cookbook.html?id=${cookbook._id}`;
        section.innerHTML = `<h3>${cookbook.title}</h3><p>${cookbook.description}</p>`;
        container.appendChild(section);
    });

    // Add button
    const add = document.createElement("section");
    add.className = "cookbook";
    add.onclick = () => location.href = 'createCookbook.html';
    add.innerHTML = `<h3>Add new Cookbook</h3><h1>+</h1>`;
    container.appendChild(add);
}
