const sidebar = document.getElementById('sidebar');

function toggleSidebar() {
    sidebar.classList.toggle('show');
}
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show");
}
document.addEventListener("click", function (event) {
    const sidebar = document.getElementById("sidebar");
    const button = document.getElementById("toggleButton");

    if (!sidebar.contains(event.target) && !button.contains(event.target)) {
        sidebar.classList.remove("show");
    }
});