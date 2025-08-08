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
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    // Display username
    const usernameDisplay = document.querySelector('.username-display');
    if (usernameDisplay && currentUser) {
        usernameDisplay.textContent = currentUser.username;
    }

    if (window.location.pathname.includes('home.html')) {
        loadCookbooks();
    } else if (window.location.pathname.includes('cookbook.html')) {
        loadRecipes();
        updateCookbookTitle();
    }
});

function updateCookbookTitle() {
    const cookbookName = localStorage.getItem('currentCookbookName');
    const titleElement = document.getElementById('cookbookTitle');
    if (titleElement && cookbookName) {
        titleElement.textContent = cookbookName;
    }
}

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
        const cookbookElement = createCookbookElement(cookbook, type === 'owned');
        if (type === 'owned') {
            container.insertBefore(cookbookElement, container.lastChild);
        } else {
            container.appendChild(cookbookElement);
        }
    });
}

// Create cookbook element
function createCookbookElement(cookbook, isOwned = false) {
    const section = document.createElement('section');
    section.className = 'cookbook';

    const editButton = isOwned ? `<button class="edit-cookbook-btn" onclick="event.stopPropagation(); showShareModal(${cookbook.book_id}, '${cookbook.Book_Name || cookbook.cookbook_name}', '${cookbook.Description || cookbook.cookbook_desc || ''}');">⚙️</button>` : '';

    section.innerHTML = `
        <h3>${cookbook.Book_Name || cookbook.cookbook_name}</h3>
        <p>${cookbook.Description || cookbook.cookbook_desc || 'No description'}</p>
        ${editButton}
    `;

    section.onclick = () => {
        localStorage.setItem('currentCookbookId', cookbook.book_id);
        localStorage.setItem('currentCookbookName', cookbook.Book_Name || cookbook.cookbook_name);
        location.href = 'cookbook.html';
    };

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

    // Check if current user is the contributor to show edit button
    const isContributor = recipe.username === currentUser.username;
    const editButton = isContributor ? `<button class="edit-recipe-btn" onclick="event.stopPropagation(); showEditRecipeModal(${recipe.recipe_id}, '${recipe.recipe_name}');">Edit</button>` : '';

    li.innerHTML = `
        <section>
            <h3>${recipe.recipe_name}</h3>
            <p>By ${recipe.username}</p>
            ${editButton}
        </section>
    `;

    li.onclick = () => viewRecipe(recipe.recipe_id);

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

    // Reset steps to just one
    const stepsContainer = document.getElementById('recipeSteps');
    stepsContainer.innerHTML = `
        <div class="recipe-step">
            <div class="step-header">
                <span class="step-number">1</span>
                <button type="button" class="remove-step" onclick="removeStep(this)" style="display: none;">×</button>
            </div>
            <div class="ingredient-section">
                <input type="text" placeholder="Ingredient name" class="ingredient-name">
                <input type="number" placeholder="Amount" class="ingredient-amount" step="0.01" min="0">
                <input type="text" placeholder="Unit" class="ingredient-unit" maxlength="6">
            </div>
            <textarea placeholder="Step description" class="step-description" rows="3"></textarea>
        </div>
    `;
}

// Add a new step to the recipe form
function addStep() {
    const stepsContainer = document.getElementById('recipeSteps');
    const stepCount = stepsContainer.children.length + 1;

    const stepDiv = document.createElement('div');
    stepDiv.className = 'recipe-step';
    stepDiv.innerHTML = `
        <div class="step-header">
            <span class="step-number">${stepCount}</span>
            <button type="button" class="remove-step" onclick="removeStep(this)">×</button>
        </div>
        <div class="ingredient-section">
            <input type="text" placeholder="Ingredient name" class="ingredient-name">
            <input type="number" placeholder="Amount" class="ingredient-amount" step="0.01" min="0">
            <input type="text" placeholder="Unit" class="ingredient-unit" maxlength="6">
        </div>
        <textarea placeholder="Step description" class="step-description" rows="3"></textarea>
    `;

    stepsContainer.appendChild(stepDiv);
    updateRemoveButtons();
}

// Remove a step from the recipe form
function removeStep(button) {
    const stepDiv = button.closest('.recipe-step');
    stepDiv.remove();
    updateStepNumbers();
    updateRemoveButtons();
}

// Update step numbers after adding/removing steps
function updateStepNumbers() {
    const steps = document.querySelectorAll('.recipe-step');
    steps.forEach((step, index) => {
        const stepNumber = step.querySelector('.step-number');
        stepNumber.textContent = index + 1;
    });
}

// Update visibility of remove buttons
function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-step');
    removeButtons.forEach(button => {
        button.style.display = removeButtons.length > 1 ? 'block' : 'none';
    });
}

// Add new recipe with steps
async function addRecipe(event) {
    event.preventDefault();

    if (!currentUser) return;

    const cookbookId = localStorage.getItem('currentCookbookId');
    const recipeName = document.getElementById('recipeName').value;

    try {
        // First create the recipe
        const recipeResponse = await fetch(`${API_BASE}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                book_id: cookbookId,
                contributor_id: currentUser.user_id,
                recipe_name: recipeName,
                image: null
            })
        });

        if (!recipeResponse.ok) {
            throw new Error('Failed to create recipe');
        }

        const recipeData = await recipeResponse.json();
        const recipeId = recipeData.recipe_id;

        // Then add all the steps
        const steps = document.querySelectorAll('.recipe-step');
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const ingredientName = step.querySelector('.ingredient-name').value;
            const ingredientAmount = step.querySelector('.ingredient-amount').value;
            const ingredientUnit = step.querySelector('.ingredient-unit').value;
            const stepDescription = step.querySelector('.step-description').value;

            if (ingredientName || stepDescription) {
                await fetch(`${API_BASE}/recipeSteps`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        step_num: i + 1,
                        from_recipe: recipeId,
                        ingredient_name: ingredientName || null,
                        ingredient_amount: ingredientAmount || null,
                        ingredient_unit: ingredientUnit || null,
                        step_desc: stepDescription || null
                    })
                });
            }
        }

        hideAddRecipeModal();
        loadRecipes(); // Reload recipes
    } catch (error) {
        console.error('Error adding recipe:', error);
        alert('Error adding recipe');
    }
}

// View recipe in modal
async function viewRecipe(recipeId) {
    try {
        const response = await fetch(`${API_BASE}/recipeSteps/${recipeId}`);
        const steps = await response.json();

        if (steps.length > 0) {
            document.getElementById('recipeModalTitle').textContent = steps[0].recipe_name;
            displayRecipeSteps(steps);
            document.getElementById('viewRecipeModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading recipe:', error);
    }
}

// Display recipe steps in the view modal
function displayRecipeSteps(steps) {
    const container = document.getElementById('recipeStepsDisplay');
    container.innerHTML = '';

    steps.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'recipe-step-display';

        let stepContent = `<h4>Step ${step.step_num}</h4>`;

        if (step.ingredient_name) {
            stepContent += `<div class="ingredient-info">
                <strong>Ingredient:</strong> ${step.ingredient_name}
                ${step.ingredient_amount ? ` - ${step.ingredient_amount}` : ''}
                ${step.ingredient_unit ? ` ${step.ingredient_unit}` : ''}
            </div>`;
        }

        if (step.step_desc) {
            stepContent += `<p>${step.step_desc}</p>`;
        }

        stepDiv.innerHTML = stepContent;
        container.appendChild(stepDiv);
    });
}

// Hide view recipe modal
function hideViewRecipeModal() {
    const modal = document.getElementById('viewRecipeModal');
    modal.style.display = 'none';
}

// Show edit recipe modal
async function showEditRecipeModal(recipeId, recipeName) {
    // Store the recipe ID for editing
    localStorage.setItem('editingRecipeId', recipeId);

    // Set the recipe name
    document.getElementById('editRecipeName').value = recipeName;

    try {
        // Load existing steps
        const response = await fetch(`${API_BASE}/recipeSteps/${recipeId}`);
        const steps = await response.json();

        // Clear existing steps in form
        const stepsContainer = document.getElementById('editRecipeSteps');
        stepsContainer.innerHTML = '';

        // Populate with existing steps
        steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'recipe-step';
            stepDiv.innerHTML = `
                    <div class="step-header">
                        <span class="step-number">${index + 1}</span>
                        <button type="button" class="remove-step" onclick="removeEditStep(this)" ${steps.length === 1 ? 'style="display: none;"' : ''}>×</button>
                    </div>
                    <div class="ingredient-section">
                        <input type="text" placeholder="Ingredient name" class="ingredient-name" value="${step.ingredient_name || ''}">
                        <input type="number" placeholder="Amount" class="ingredient-amount" step="0.01" min="0" value="${step.ingredient_amount || ''}">
                        <input type="text" placeholder="Unit" class="ingredient-unit" maxlength="6" value="${step.ingredient_unit || ''}">
                    </div>
                    <textarea placeholder="Step description" class="step-description" rows="3">${step.step_desc || ''}</textarea>
                `;
            stepsContainer.appendChild(stepDiv);
        });


        updateEditRemoveButtons();
        document.getElementById('editRecipeModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading recipe for editing:', error);
        alert('Error loading recipe for editing');
    }
}

// Hide edit recipe modal
function hideEditRecipeModal() {
    const modal = document.getElementById('editRecipeModal');
    modal.style.display = 'none';
    document.getElementById('editRecipeForm').reset();
    localStorage.removeItem('editingRecipeId');
}

// Add step to edit form
function addEditStep() {
    const stepsContainer = document.getElementById('editRecipeSteps');
    const stepCount = stepsContainer.children.length + 1;

    const stepDiv = document.createElement('div');
    stepDiv.className = 'recipe-step';
    stepDiv.innerHTML = `
        <div class="step-header">
            <span class="step-number">${stepCount}</span>
            <button type="button" class="remove-step" onclick="removeEditStep(this)">×</button>
        </div>
        <div class="ingredient-section">
            <input type="text" placeholder="Ingredient name" class="ingredient-name">
            <input type="number" placeholder="Amount" class="ingredient-amount" step="0.01" min="0">
            <input type="text" placeholder="Unit" class="ingredient-unit" maxlength="6">
        </div>
        <textarea placeholder="Step description" class="step-description" rows="3"></textarea>
    `;

    stepsContainer.appendChild(stepDiv);
    updateEditRemoveButtons();
}

// Remove step from edit form
function removeEditStep(button) {
    const stepDiv = button.closest('.recipe-step');
    stepDiv.remove();
    updateEditStepNumbers();
    updateEditRemoveButtons();
}

// Update step numbers in edit form
function updateEditStepNumbers() {
    const steps = document.querySelectorAll('#editRecipeSteps .recipe-step');
    steps.forEach((step, index) => {
        const stepNumber = step.querySelector('.step-number');
        stepNumber.textContent = index + 1;
    });
}

// Update remove buttons in edit form
function updateEditRemoveButtons() {
    const removeButtons = document.querySelectorAll('#editRecipeSteps .remove-step');
    removeButtons.forEach(button => {
        button.style.display = removeButtons.length > 1 ? 'block' : 'none';
    });
}

// Update recipe
async function updateRecipe(event) {
    event.preventDefault();

    const recipeId = localStorage.getItem('editingRecipeId');
    const cookbookId = localStorage.getItem('currentCookbookId');
    const recipeName = document.getElementById('editRecipeName').value;

    console.log('Updating recipe:', { recipeId, cookbookId, recipeName });

    if (!recipeId) {
        alert('No recipe ID found for editing');
        return;
    }

    try {
        // Update recipe name
        console.log('Updating recipe name...');
        const recipeResponse = await fetch(`${API_BASE}/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                book_id: cookbookId,
                recipe_name: recipeName
            })
        });

        console.log('Recipe update response status:', recipeResponse.status);
        console.log('Recipe update response ok:', recipeResponse.ok);

        if (!recipeResponse.ok) {
            const errorData = await recipeResponse.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Recipe update error:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${recipeResponse.status}`);
        }

        // Delete all existing steps for this recipe
        console.log('Deleting existing steps...');
        const deleteResponse = await fetch(`${API_BASE}/recipeSteps/recipe/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Delete steps response status:', deleteResponse.status);

        if (!deleteResponse.ok) {
            console.warn('Failed to delete existing steps, but continuing...');
        }

        // Add all the updated steps
        console.log('Adding updated steps...');
        const steps = document.querySelectorAll('#editRecipeSteps .recipe-step');
        let stepCount = 0;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const ingredientName = step.querySelector('.ingredient-name').value;
            const ingredientAmount = step.querySelector('.ingredient-amount').value;
            const ingredientUnit = step.querySelector('.ingredient-unit').value;
            const stepDescription = step.querySelector('.step-description').value;

            if (ingredientName || stepDescription) {
                console.log(`Adding step ${i + 1}:`, { ingredientName, ingredientAmount, ingredientUnit, stepDescription });

                const stepResponse = await fetch(`${API_BASE}/recipeSteps`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        step_num: i + 1,
                        from_recipe: recipeId,
                        ingredient_name: ingredientName || null,
                        ingredient_amount: ingredientAmount || null,
                        ingredient_unit: ingredientUnit || null,
                        step_desc: stepDescription || null
                    })
                });

                if (!stepResponse.ok) {
                    console.warn(`Failed to add step ${i + 1}`);
                } else {
                    stepCount++;
                }
            }
        }

        console.log(`Successfully added ${stepCount} steps`);
        hideEditRecipeModal();
        loadRecipes(); // Reload recipes
        alert('Recipe updated successfully!');
    } catch (error) {
        console.error('Error updating recipe:', error);
        alert(`Error updating recipe: ${error.message}`);
    }
}

// Close modals when clicking outside
window.onclick = function (event) {
    const cookbookModal = document.getElementById('addCookbookModal');
    const recipeModal = document.getElementById('addRecipeModal');
    const editRecipeModal = document.getElementById('editRecipeModal');
    const viewModal = document.getElementById('viewRecipeModal');
    const shareModal = document.getElementById('shareCookbookModal');

    if (event.target === cookbookModal) {
        hideAddCookbookModal();
    }
    if (event.target === recipeModal) {
        hideAddRecipeModal();
    }
    if (event.target === editRecipeModal) {
        hideEditRecipeModal();
    }
    if (event.target === viewModal) {
        hideViewRecipeModal();
    }
    if (event.target === shareModal) {
        hideShareModal();
    }
}

// Show share cookbook modal (updated to include edit functionality)
function showShareModal(cookbookId, cookbookName, cookbookDesc = '') {
    document.getElementById('shareCookbookId').value = cookbookId;
    document.getElementById('shareCookbookTitle').textContent = cookbookName;

    // Set edit form values
    document.getElementById('editCookbookName').value = cookbookName;
    document.getElementById('editCookbookDescription').value = cookbookDesc;

    loadContributors(cookbookId);
    loadAllUsers();
    document.getElementById('shareCookbookModal').style.display = 'block';
}

// Hide share cookbook modal
function hideShareModal() {
    document.getElementById('shareCookbookModal').style.display = 'none';
    document.getElementById('shareUserSelect').value = '';
}

// Update cookbook
async function updateCookbook(event) {
    event.preventDefault();

    const cookbookId = document.getElementById('shareCookbookId').value;
    const cookbookName = document.getElementById('editCookbookName').value;
    const cookbookDesc = document.getElementById('editCookbookDescription').value;

    console.log('Updating cookbook:', { cookbookId, cookbookName, cookbookDesc });

    try {
        const response = await fetch(`${API_BASE}/cookbooks/${cookbookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cookbook_name: cookbookName,
                cookbook_desc: cookbookDesc
            })
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Server error:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json().catch(() => ({ message: 'Success' }));
        console.log('Update result:', result);

        // Update the modal title
        document.getElementById('shareCookbookTitle').textContent = cookbookName;

        // Update localStorage if this is the current cookbook
        const currentCookbookId = localStorage.getItem('currentCookbookId');
        if (currentCookbookId == cookbookId) {
            localStorage.setItem('currentCookbookName', cookbookName);
            updateCookbookTitle();
        }

        // Reload cookbooks on home page
        if (window.location.pathname.includes('home.html')) {
            loadCookbooks();
        }

        alert('Cookbook updated successfully!');
    } catch (error) {
        console.error('Error updating cookbook:', error);
        alert(`Error updating cookbook: ${error.message}`);
    }
}

// Load current contributors
async function loadContributors(cookbookId) {
    try {
        const response = await fetch(`${API_BASE}/cookbooks/contributors/${cookbookId}`);
        const contributors = await response.json();

        const container = document.getElementById('contributorsList');
        container.innerHTML = '';

        contributors.forEach(contributor => {
            const div = document.createElement('div');
            div.className = 'contributor-item';
            div.innerHTML = `
                <span>${contributor.username}</span>
                <button onclick="removeContributor(${cookbookId}, ${contributor.user_id})" class="remove-contributor">Remove</button>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading contributors:', error);
    }
}

// Load all users for sharing
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();

        const select = document.getElementById('shareUserSelect');
        select.innerHTML = '<option value="">Select a user...</option>';

        users.forEach(user => {
            if (user.user_id !== currentUser.user_id) {
                const option = document.createElement('option');
                option.value = user.user_id;
                option.textContent = user.username;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Share cookbook with user
async function shareCookbook() {
    const cookbookId = document.getElementById('shareCookbookId').value;
    const userId = document.getElementById('shareUserSelect').value;

    if (!userId) {
        alert('Please select a user to share with');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cookbooks/shareWith/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                book_id: cookbookId,
                user_id: userId
            })
        });

        if (response.ok) {
            loadContributors(cookbookId);
            document.getElementById('shareUserSelect').value = '';
        } else {
            alert('Error sharing cookbook');
        }
    } catch (error) {
        console.error('Error sharing cookbook:', error);
        alert('Error sharing cookbook');
    }
}

// Remove contributor
async function removeContributor(cookbookId, userId) {
    try {
        const response = await fetch(`${API_BASE}/cookbooks/removeShare/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                book_id: cookbookId,
                user_id: userId
            })
        });

        if (response.ok) {
            loadContributors(cookbookId);
        } else {
            alert('Error removing contributor');
        }
    } catch (error) {
        console.error('Error removing contributor:', error);
        alert('Error removing contributor');
    }
}