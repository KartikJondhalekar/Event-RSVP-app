/* ===== Authentication & Authorization Utilities =====
Handles user login state, token storage, and role-based access control */

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Save user to localStorage
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Get JWT token
function getAuthToken() {
    const user = getCurrentUser();
    return user ? user.token : null;
}

// Check if user is logged in
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// Check if current user has admin role
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Logout user
function logout() {
    setCurrentUser(null);
    window.location.reload();
}

// Add auth header to API calls
function getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Show/hide elements based on authentication state
function updateUIForAuth() {
    const user = getCurrentUser();
    const isLoggedIn = user !== null;
    const userIsAdmin = isAdmin();
    
    // Update navigation
    const authSection = document.getElementById('authSection');
    if (authSection) {
        if (isLoggedIn) {
            authSection.innerHTML = `
                <span class="user-name">Welcome, ${user.full_name}</span>
                ${userIsAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                <button class="auth-btn logout-btn" onclick="logout()">Logout</button>
            `;
        } else {
            authSection.innerHTML = `
                <button class="auth-btn" onclick="showAuthModal('login')">Login</button>
                <button class="auth-btn" onclick="showAuthModal('register')">Register</button>
            `;
        }
    }
    
    // Show/hide admin-only elements
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        el.style.display = userIsAdmin ? 'block' : 'none';
    });
    
    // Show/hide auth-required elements
    const authElements = document.querySelectorAll('.auth-required');
    authElements.forEach(el => {
        el.style.display = isLoggedIn ? 'block' : 'none';
    });
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const result = await apiCall('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        // Save user data including token
        setCurrentUser(result.user);
        
        showMessage('Login successful!', 'success');
        closeAuthModal();
        
        // Refresh the page to update UI
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        showAuthMessage(error.message, 'error');
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }
    
    const registerData = {
        email: formData.get('email'),
        password: password,
        full_name: formData.get('full_name')
    };
    
    try {
        const result = await apiCall('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        
        showAuthMessage('Registration successful! Please login.', 'success');
        
        // Switch to login form after 2 seconds
        setTimeout(() => showAuthModal('login'), 2000);
    } catch (error) {
        showAuthMessage(error.message, 'error');
    }
}

// Show auth modal
function showAuthModal(mode) {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    
    modal.style.display = 'block';
}

// Close auth modal
function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Show message in auth modal
function showAuthMessage(message, type) {
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.padding = '12px 16px';
    messageDiv.style.margin = '16px 0';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.fontWeight = '500';
    messageDiv.style.fontSize = '0.95rem';
    
    if (type === 'error') {
        messageDiv.style.backgroundColor = '#fef2f2';
        messageDiv.style.color = '#dc2626';
        messageDiv.style.border = '1px solid #fecaca';
    } else {
        messageDiv.style.backgroundColor = '#f0fdf4';
        messageDiv.style.color = '#16a34a';
        messageDiv.style.border = '1px solid #bbf7d0';
    }
    
    const activeForm = document.querySelector('#authModal form[style*="block"]');
    if (activeForm) {
        activeForm.parentNode.insertBefore(messageDiv, activeForm);
    }
}