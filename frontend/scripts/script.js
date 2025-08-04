const API_BASE = 'http://localhost:3000/api';

// Get current user from localStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Redirect to login if no user is logged in
if (!currentUser && !window.location.pathname.includes('login.html')) {
    window.location.href = './login.html';
}

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

// Handle logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = './login.html';
}

// Add logout functionality to logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    if (window.location.pathname.includes('home.html')) {
        loadCookbooks();
    } else if (window.location.pathname.includes('cookbook.html')) {
        loadRecipes();
    }
});

// Load cookbooks from database
async function loadCookbooks() {
    if (!currentUser) return;
    
    try {
        // Load owned cookbooks
        const ownedResponse = await fetch(`${API_BASE}/cookbooks/owner/${currentUser.user_id}`);
        const ownedCookbooks = await ownedResponse.json();
        
        // Load shared cookbooks
        const sharedResponse = await fetch(`${API_BASE}/cookbooks/sharedWith/${currentUser.user_id}`);
        const sharedCookbooks = await sharedResponse.json();
        
        displayCookbooks(ownedCookbooks, 'owned');
        displayCookbooks(sharedCookbooks, 'shared');
    } catch (error) {
        console.error('Error loading cookbooks:', error);
    }
}

// Display cookbooks in the UI
function displayCookbooks(cookbooks, type) {
    const containerSelector = type === 'owned' ? '.cookbookContainer:first-of-type .flex-container' : '.cookbookContainer:last-of-type .flex-container';
    const container = document.querySelector(containerSelector);
    
    if (!container) return;
    
    // Clear existing cookbooks (except the add button for owned)
    if (type === 'owned') {
        const addButton = container.querySelector('.cookbook:last-child');
        container.innerHTML = '';
        container.appendChild(addButton);
    } else {
        container.innerHTML = '';
    }
    
    // Add cookbooks
    cookbooks.forEach(cookbook => {
        const cookbookElement = createCookbookElement(cookbook);
        if (type === 'owned') {
            container.insertBefore(cookbookElement, container.lastChild);
        } else {
            container.appendChild(cookbookElement);
        }
    });
}

// Create cookbook element
function createCookbookElement(cookbook) {
    const section = document.createElement('section');
    section.className = 'cookbook';
    section.onclick = () => {
        localStorage.setItem('currentCookbookId', cookbook.book_id);
        localStorage.setItem('currentCookbookName', cookbook.Book_Name || cookbook.cookbook_name);
        location.href = 'cookbook.html';
    };
    
    section.innerHTML = `
        <h3>${cookbook.Book_Name || cookbook.cookbook_name}</h3>
        <p>${cookbook.Description || cookbook.cookbook_desc || 'No description'}</p>
    `;
    
    return section;
}

// Show add cookbook modal
function showAddCookbookModal() {
    const modal = document.getElementById('addCookbookModal');
    modal.style.display = 'block';
}

// Hide add cookbook modal
function hideAddCookbookModal() {
    const modal = document.getElementById('addCookbookModal');
    modal.style.display = 'none';
    document.getElementById('cookbookForm').reset();
}

// Add new cookbook
async function addCookbook(event) {
    event.preventDefault();
    
    if (!currentUser) return;
    
    const name = document.getElementById('cookbookName').value;
    const description = document.getElementById('cookbookDescription').value;
    
    try {
        const response = await fetch(`${API_BASE}/cookbooks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                owner_id: currentUser.user_id,
                cookbook_name: name,
                cookbook_desc: description
            })
        });
        
        if (response.ok) {
            hideAddCookbookModal();
            loadCookbooks(); // Reload cookbooks
        } else {
            alert('Error adding cookbook');
        }
    } catch (error) {
        console.error('Error adding cookbook:', error);
        alert('Error adding cookbook');
    }
}

// Load recipes for current cookbook
async function loadRecipes() {
    const cookbookId = localStorage.getItem('currentCookbookId');
    const cookbookName = localStorage.getItem('currentCookbookName');
    
    if (!cookbookId) {
        // Redirect to home if no cookbook selected
        location.href = 'home.html';
        return;
    }
    
    // Update page title
    document.title = `${cookbookName} - KitchenSync`;
    
    try {
        const response = await fetch(`${API_BASE}/recipes/${cookbookId}`);
        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
}

// Display recipes in the UI
function displayRecipes(recipes) {
    const container = document.getElementById('recipeList');
    if (!container) return;
    
    // Clear existing recipes except the add button
    const addButton = container.querySelector('li:last-child');
    container.innerHTML = '';
    
    // Add recipes
    recipes.forEach(recipe => {
        const recipeElement = createRecipeElement(recipe);
        container.appendChild(recipeElement);
    });
    
    // Re-add the "Create new recipe" button
    container.appendChild(addButton);
}

// Create recipe element
function createRecipeElement(recipe) {
    const li = document.createElement('li');
    li.className = 'recipeItem';
    li.onclick = () => {
        localStorage.setItem('currentRecipeId', recipe.recipe_id);
        location.href = 'recipe.html';
    };
    
    li.innerHTML = `
        <section>
            <h3>${recipe.recipe_name}</h3>
            <p>By ${recipe.username}</p>
        </section>
    `;
    
    return li;
}

// Show add recipe modal
function showAddRecipeModal() {
    const modal = document.getElementById('addRecipeModal');
    modal.style.display = 'block';
}

// Hide add recipe modal
function hideAddRecipeModal() {
    const modal = document.getElementById('addRecipeModal');
    modal.style.display = 'none';
    document.getElementById('recipeForm').reset();
}

// Add new recipe
async function addRecipe(event) {
    event.preventDefault();
    
    if (!currentUser) return;
    
    const cookbookId = localStorage.getItem('currentCookbookId');
    const recipeName = document.getElementById('recipeName').value;
    
    try {
        const response = await fetch(`${API_BASE}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                book_id: cookbookId,
                contributor_id: currentUser.user_id,
                recipe_name: recipeName,
                image: null // We'll implement image upload later
            })
        });
        
        if (response.ok) {
            hideAddRecipeModal();
            loadRecipes(); // Reload recipes
        } else {
            alert('Error adding recipe');
        }
    } catch (error) {
        console.error('Error adding recipe:', error);
        alert('Error adding recipe');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const cookbookModal = document.getElementById('addCookbookModal');
    const recipeModal = document.getElementById('addRecipeModal');
    
    if (event.target === cookbookModal) {
        hideAddCookbookModal();
    }
    if (event.target === recipeModal) {
        hideAddRecipeModal();
    }
}