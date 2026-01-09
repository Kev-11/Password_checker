// ============================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ============================================

// Load Firebase configuration from window object (set by template)
const firebaseConfig = window.FIREBASE_CONFIG || {};

// Initialize Firebase (will be done dynamically)
let app, auth, database;

// ============================================
// SESSION TIMEOUT MANAGEMENT
// ============================================

let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

// Check if Remember Me is enabled
function isRememberMeEnabled() {
    return localStorage.getItem('rememberedEmail') !== null;
}

// Reset inactivity timer
function resetInactivityTimer() {
    // Don't apply timeout if Remember Me is enabled
    if (isRememberMeEnabled()) {
        return;
    }

    // Clear existing timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }

    // Set new timer
    inactivityTimer = setTimeout(() => {
        autoLogout();
    }, INACTIVITY_TIMEOUT);
}

// Auto logout due to inactivity
function autoLogout() {
    if (auth && auth.currentUser) {
        auth.signOut().then(() => {
            showNotification('Session expired due to inactivity', 'warning');
            // Clear timer
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
                inactivityTimer = null;
            }
        });
    }
}

// Start tracking user activity
function startActivityTracking() {
    // Don't track if Remember Me is enabled
    if (isRememberMeEnabled()) {
        return;
    }

    // Start initial timer
    resetInactivityTimer();

    // Track user activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
}

// Stop tracking user activity
function stopActivityTracking() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
    });
}

// Initialize Firebase when DOM loads
function initializeFirebase() {
    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        database = firebase.database();
        console.log("Firebase initialized successfully");
        checkAuthState();
    } catch (error) {
        console.error("Firebase initialization error:", error);
        // If Firebase config is not set, show instructions
        showFirebaseSetupInstructions();
    }
}

// ============================================
// MATRIX BACKGROUND EFFECT
// ============================================

function initMatrixBackground() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(5, 8, 19, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff41';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 33);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            showMainApp(user);
            loadUserHistory(user.uid);
        } else {
            // User is signed out
            showAuthModal();
        }
    });
}

// Show/Hide modals
function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function showMainApp(user) {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    document.getElementById('user-email').textContent = user.email;
    
    // Start activity tracking for session timeout
    startActivityTracking();
}

// Switch between login and signup forms
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

// Login function
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }

    try {
        // Set persistence based on remember me checkbox
        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;
        
        await auth.setPersistence(persistence);
        await auth.signInWithEmailAndPassword(email, password);
        
        // Save email if remember me is checked
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        showNotification('Login successful!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getErrorMessage(error.code), 'error');
    }
}

// Signup function
async function signup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    if (!email || !password || !confirmPassword) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showNotification('Account created successfully!', 'success');
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(getErrorMessage(error.code), 'error');
    }
}

// Logout function
async function logout() {
    // Stop activity tracking
    stopActivityTracking();
    
    try {
        await auth.signOut();
        showNotification('Logged out successfully', 'success');
        clearLocalData();
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

// Google Sign-In function
async function googleSignIn() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        showNotification('Google sign-in successful!', 'success');
    } catch (error) {
        console.error('Google sign-in error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            showNotification('Sign-in cancelled', 'info');
        } else {
            showNotification(getErrorMessage(error.code), 'error');
        }
    }
}

// Delete Account function
async function deleteAccount() {
    const user = auth.currentUser;
    if (!user) {
        showNotification('No user logged in', 'error');
        return;
    }

    // Confirm deletion
    const confirmMsg = `Are you sure you want to delete your account?\n\nEmail: ${user.email}\n\nThis action CANNOT be undone!\n\nAll your data including scan history will be permanently deleted.`;
    
    if (!confirm(confirmMsg)) {
        return;
    }

    // Second confirmation
    const finalConfirm = confirm('FINAL WARNING: This will permanently delete everything. Are you absolutely sure?');
    if (!finalConfirm) {
        return;
    }

    try {
        // Delete user data from database first
        await database.ref(`users/${user.uid}`).remove();
        
        // Delete the user account
        await user.delete();
        
        // Clear local storage
        localStorage.removeItem('rememberedEmail');
        clearLocalData();
        
        showNotification('Account deleted successfully', 'success');
    } catch (error) {
        console.error('Delete account error:', error);
        
        if (error.code === 'auth/requires-recent-login') {
            showNotification('For security, please logout and login again before deleting account', 'error');
        } else {
            showNotification('Error deleting account: ' + error.message, 'error');
        }
    }
}

// ============================================
// PASSWORD CHECKING FUNCTIONS
// ============================================

// Toggle password visibility
function togglePasswordVisibility() {
    const input = document.getElementById('password-input');
    const button = document.getElementById('toggle-visibility');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// Check password
async function checkPassword() {
    const password = document.getElementById('password-input').value;
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');
    const loading = document.getElementById('loading');

    if (!password) {
        showNotification('Please enter a password to check', 'error');
        return;
    }

    // Show loading
    resultContainer.style.display = 'none';
    loading.style.display = 'block';

    try {
        const response = await fetch('/api/check-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        });

        const data = await response.json();

        // Hide loading
        loading.style.display = 'none';

        if (data.success) {
            // Show result
            displayResult(data);

            // Save to history
            const user = auth.currentUser;
            if (user) {
                await saveToHistory(user.uid, {
                    pwned: data.pwned,
                    count: data.count,
                    timestamp: data.timestamp
                });
                loadUserHistory(user.uid);
            }

            // Update stats
            updateStats();
        } else {
            showNotification('Error checking password: ' + data.error, 'error');
        }

        // Clear input
        document.getElementById('password-input').value = '';

    } catch (error) {
        loading.style.display = 'none';
        console.error('Error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Display result
function displayResult(data) {
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');

    resultContainer.style.display = 'block';

    if (data.pwned) {
        resultContent.className = 'result-content result-danger';
        resultContent.innerHTML = `
            <div class="result-icon">⚠️</div>
            <div class="result-title">PASSWORD COMPROMISED</div>
            <div class="result-message">
                <p>This password has been found in <strong>${data.count.toLocaleString()}</strong> data breaches.</p>
                <p>⚠️ Do NOT use this password! It is highly vulnerable.</p>
                <p>Recommendation: Use a unique, strong password or a password manager.</p>
            </div>
        `;
    } else {
        resultContent.className = 'result-content result-safe';
        resultContent.innerHTML = `
            <div class="result-icon">✅</div>
            <div class="result-title">PASSWORD SECURE</div>
            <div class="result-message">
                <p>Good news! This password has NOT been found in any known data breaches.</p>
                <p>✓ However, always use unique passwords for each account.</p>
                <p>✓ Consider using a password manager for better security.</p>
            </div>
        `;
    }

    // Add glitch effect
    resultContent.classList.add('glitch-effect');
    setTimeout(() => {
        resultContent.classList.remove('glitch-effect');
    }, 300);
}

// ============================================
// FIREBASE DATABASE FUNCTIONS
// ============================================

// Save check to history
async function saveToHistory(userId, checkData) {
    try {
        const historyRef = database.ref(`users/${userId}/history`);
        await historyRef.push({
            ...checkData,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

// Load user history
async function loadUserHistory(userId) {
    try {
        const historyRef = database.ref(`users/${userId}/history`).orderByChild('timestamp').limitToLast(20);
        
        historyRef.on('value', (snapshot) => {
            const historyList = document.getElementById('history-list');
            historyList.innerHTML = '';

            const data = snapshot.val();
            
            if (!data) {
                historyList.innerHTML = '<p class="dim-text">No scan history available. Initiate a scan to begin.</p>';
                return;
            }

            const historyArray = Object.entries(data).reverse();

            historyArray.forEach(([key, item]) => {
                const historyItem = document.createElement('div');
                historyItem.className = `history-item ${item.pwned ? 'danger' : 'safe'}`;
                
                const date = new Date(item.timestamp);
                const formattedDate = date.toLocaleString();

                historyItem.innerHTML = `
                    <div class="history-timestamp">${formattedDate}</div>
                    <div class="history-status">
                        ${item.pwned ? 
                            `⚠️ COMPROMISED (${item.count} breaches)` : 
                            '✓ SECURE'
                        }
                    </div>
                `;

                historyList.appendChild(historyItem);
            });
        });
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Clear history
async function clearHistory() {
    const user = auth.currentUser;
    if (!user) return;

    if (confirm('Are you sure you want to clear your scan history?')) {
        try {
            await database.ref(`users/${user.uid}/history`).remove();
            showNotification('History cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing history:', error);
            showNotification('Error clearing history', 'error');
        }
    }
}

// Update statistics
function updateStats() {
    const user = auth.currentUser;
    if (!user) return;

    database.ref(`users/${user.uid}/history`).once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            document.getElementById('total-scans').textContent = '0';
            document.getElementById('pwned-count').textContent = '0';
            document.getElementById('safe-count').textContent = '0';
            return;
        }

        const historyArray = Object.values(data);
        const totalScans = historyArray.length;
        const pwnedCount = historyArray.filter(item => item.pwned).length;
        const safeCount = totalScans - pwnedCount;

        document.getElementById('total-scans').textContent = totalScans;
        document.getElementById('pwned-count').textContent = pwnedCount;
        document.getElementById('safe-count').textContent = safeCount;
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(255, 0, 85, 0.9)' : 
                     type === 'success' ? 'rgba(0, 255, 65, 0.9)' : 
                     'rgba(0, 217, 255, 0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 6px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Get user-friendly error message
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/weak-password': 'Password is too weak',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/too-many-requests': 'Too many attempts. Try again later.'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// Clear local data
function clearLocalData() {
    document.getElementById('history-list').innerHTML = '<p class="dim-text">No scan history available.</p>';
    document.getElementById('total-scans').textContent = '0';
    document.getElementById('pwned-count').textContent = '0';
    document.getElementById('safe-count').textContent = '0';
    document.getElementById('result-container').style.display = 'none';
}

// Show Firebase setup instructions if not configured
function showFirebaseSetupInstructions() {
    console.warn("Firebase not properly configured!");
    console.log("Please follow these steps:");
    console.log("1. Create a Firebase project at https://console.firebase.google.com/");
    console.log("2. Enable Authentication (Email/Password)");
    console.log("3. Enable Realtime Database");
    console.log("4. Copy your Firebase config to .env file");
    console.log("5. Restart the application");
    
    // Allow app to run in demo mode without Firebase
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    document.getElementById('user-email').textContent = 'demo@local';
    
    showNotification('Running in demo mode. Configure Firebase for full features.', 'info');
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Enter key in password input
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        
        if (activeElement.id === 'password-input') {
            checkPassword();
        } else if (activeElement.id === 'login-password') {
            login();
        } else if (activeElement.id === 'signup-confirm') {
            signup();
        }
    }

    // Escape key to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('auth-modal');
        if (modal.style.display === 'flex') {
            closeAuthModal();
        }
    }
});

// ============================================
// INITIALIZATION
// ============================================

// ============================================
// THEME MANAGEMENT
// ============================================

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('appTheme') || 'green';
    applyTheme(savedTheme);
}

// Apply theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('appTheme', theme);
}

// Change theme
function changeTheme(theme) {
    applyTheme(theme);
    toggleThemeMenu();
    showNotification(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}!`, 'success');
}

// Toggle theme menu
function toggleThemeMenu() {
    const menu = document.getElementById('theme-menu');
    if (menu.style.display === 'none') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Close theme menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('theme-menu');
    const themeBtn = document.querySelector('.theme-btn');
    
    if (menu && themeBtn && !menu.contains(e.target) && !themeBtn.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize matrix background
    initMatrixBackground();

    // Load theme
    loadTheme();

    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const loginEmailInput = document.getElementById('login-email');
        if (loginEmailInput) {
            loginEmailInput.value = rememberedEmail;
            document.getElementById('remember-me').checked = true;
        }
    }

    // Try to initialize Firebase
    try {
        // Check if Firebase config has actual values
        if (firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '') {
            initializeFirebase();
        } else {
            // Demo mode - no Firebase
            showFirebaseSetupInstructions();
        }
    } catch (error) {
        console.error("Initialization error:", error);
        showFirebaseSetupInstructions();
    }
});
