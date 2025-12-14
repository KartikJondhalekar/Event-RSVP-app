/* ===== Authentication & Authorization Utilities =====
Handles user login state, token storage, and role-based access control */

// Initialize modals when page loads
function initAuthModals() {
    createAuthModal();
    createAddEventModal();
}

// Create authentication modal dynamically
function createAuthModal() {
    const modalHTML = `
        <div class="modal" id="authModal">
            <button class="close-btn" onclick="closeAuthModal()">X</button>
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-body" style="padding: 40px;">
                    <!-- Login Form -->
                    <div id="loginForm">
                        <h2 style="margin-bottom: 20px; color: #2c3e50;">Login</h2>
                        <form onsubmit="handleLogin(event)">
                            <div class="form-group">
                                <label for="loginEmail">Email *</label>
                                <input type="email" id="loginEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Password *</label>
                                <input type="password" id="loginPassword" name="password" required>
                            </div>
                            <button type="submit" class="submit-btn">Login</button>
                        </form>
                        <p style="text-align: center; margin-top: 20px; color: #7f8c8d;">
                            Don't have an account? 
                            <a href="#" onclick="showAuthModal('register'); return false;" style="color: #3498db;">Register</a>
                        </p>
                    </div>

                    <!-- Register Form -->
                    <div id="registerForm" style="display: none;">
                        <h2 style="margin-bottom: 20px; color: #2c3e50;">Register</h2>
                        <form onsubmit="handleRegister(event)">
                            <div class="form-group">
                                <label for="registerName">Full Name *</label>
                                <input type="text" id="registerName" name="full_name" required>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">Email *</label>
                                <input type="email" id="registerEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Password *</label>
                                <input type="password" id="registerPassword" name="password" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password *</label>
                                <input type="password" id="confirmPassword" name="confirm_password" required minlength="6">
                            </div>
                            <button type="submit" class="submit-btn">Register</button>
                        </form>
                        <p style="text-align: center; margin-top: 20px; color: #7f8c8d;">
                            Already have an account? 
                            <a href="#" onclick="showAuthModal('login'); return false;" style="color: #3498db;">Login</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Create add event modal dynamically
function createAddEventModal() {
    const modalHTML = `
        <div class="modal" id="addEventModal">
            <button class="close-btn" onclick="closeAddEventModal()">X</button>
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-body" style="padding: 40px;">
                    <h2 style="margin-bottom: 20px; color: #2c3e50;">Create New Event</h2>
                    <form onsubmit="handleAddEvent(event)" class="rsvp-form">
                        <div class="form-group">
                            <label for="eventTitle">Event Title *</label>
                            <input type="text" id="eventTitle" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="eventDescription">Description</label>
                            <textarea id="eventDescription" name="description" rows="3" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; font-family: inherit;"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="eventVenue">Venue *</label>
                            <input type="text" id="eventVenue" name="venue" required>
                        </div>
                        <div class="form-group">
                            <label for="eventDate">Event Date & Time *</label>
                            <input type="datetime-local" id="eventDate" name="start_at" required>
                        </div>
                        <div class="form-group">
                            <label for="eventBanner">Banner Image URL</label>
                            <input type="url" id="eventBanner" name="banner_url" placeholder="https://example.com/image.jpg">
                        </div>
                        <button type="submit" class="submit-btn">Create Event</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

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
    const header = document.querySelector('.header');
    if (header) {
        header.style.transition = 'opacity 0.2s ease-out';
        header.style.opacity = '0';
    }
    setTimeout(() => {
        setCurrentUser(null);
        window.location.reload();
    }, 200);
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

    // Disable submit button and show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    submitBtn.style.opacity = '0.7';

    try {
        const result = await apiCall('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        // Save user data
        setCurrentUser(result.user);

        // Smooth fade out modal
        const modal = document.getElementById('authModal');
        modal.style.transition = 'opacity 0.2s ease-out';
        modal.style.opacity = '0';

        // Close modal after fade
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1'; // Reset for next time
        }, 200);

        // Update UI immediately - NO PAGE RELOAD!
        updateUIForAuth();

        // Reload events to show admin button if admin
        loadEvents();

        // Show success message briefly
        showTopMessage('✓ Login successful!', 'success');

    } catch (error) {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';

        showAuthMessage(error.message || 'Login failed', 'error');
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

    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    submitBtn.style.opacity = '0.7';

    try {
        await apiCall('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });

        showAuthMessage('✓ Account created! Please login.', 'success');
        event.target.reset();

        // Smooth fade transition between forms
        setTimeout(() => {
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');

            registerForm.style.transition = 'opacity 0.2s ease-out';
            registerForm.style.opacity = '0';

            setTimeout(() => {
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
                loginForm.style.opacity = '0';

                setTimeout(() => {
                    loginForm.style.transition = 'opacity 0.2s ease-in';
                    loginForm.style.opacity = '1';
                }, 10);
            }, 200);
        }, 1500);

    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';

        showAuthMessage(error.message || 'Registration failed', 'error');
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

// Show add event modal
function showAddEventModal() {
    if (!isAdmin()) {
        alert('Only administrators can add events');
        return;
    }
    document.getElementById('addEventModal').style.display = 'block';
}

// Close add event modal
function closeAddEventModal() {
    const modal = document.getElementById('addEventModal');
    modal.style.display = 'none';
    // Reset form
    modal.querySelector('form').reset();
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