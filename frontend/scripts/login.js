const API_BASE = 'http://localhost:3000/api';

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const signUpMobile = document.getElementById('signUpMobile');
const signInMobile = document.getElementById('signInMobile');
const container = document.getElementById('container');

// Panel switching functionality
signUpButton?.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton?.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

signUpMobile?.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInMobile?.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

// Add form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    // Sign Up Form Handler
    const signUpForm = document.querySelector('.sign-up-container form');
    signUpForm.addEventListener('submit', handleSignUp);
    
    // Sign In Form Handler
    const signInForm = document.querySelector('.sign-in-container form');
    signInForm.addEventListener('submit', handleSignIn);
});

async function handleSignUp(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[placeholder="Email"]').value;
    const username = form.querySelector('input[placeholder="Username"]').value;
    const password = form.querySelector('input[placeholder="Password"]').value;
    
    // Basic validation
    if (!email || !username || !password) {
        showError('All fields are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Account created successfully! You can now sign in.');
            // Switch to sign in panel
            container.classList.remove("right-panel-active");
            // Clear form
            form.reset();
        } else {
            showError(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Network error. Please try again.');
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.querySelector('input[placeholder="Username"]').value;
    const password = form.querySelector('input[placeholder="Password"]').value;
    
    if (!username || !password) {
        showError('Username and password are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store user data in localStorage for the session
            localStorage.setItem('currentUser', JSON.stringify({
                user_id: data.user_id,
                username: data.username,
                email: data.email
            }));
            
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = './home.html';
            }, 1500);
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    }
}

function showError(message) {
    // Remove any existing messages
    removeMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        border: 1px solid #f5c6cb;
        text-align: center;
        font-size: 14px;
    `;
    
    // Add to both forms
    document.querySelector('.sign-up-container form').appendChild(errorDiv.cloneNode(true));
    document.querySelector('.sign-in-container form').appendChild(errorDiv);
}

function showSuccess(message) {
    // Remove any existing messages
    removeMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        background-color: #d4edda;
        color: #155724;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        border: 1px solid #c3e6cb;
        text-align: center;
        font-size: 14px;
    `;
    
    // Add to both forms
    document.querySelector('.sign-up-container form').appendChild(successDiv.cloneNode(true));
    document.querySelector('.sign-in-container form').appendChild(successDiv);
}

function removeMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(msg => {
        msg.remove();
    });
}