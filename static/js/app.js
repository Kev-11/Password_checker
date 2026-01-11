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

    // Enforce minimum Medium (Fair) strength requirement
    const { score, level } = calculatePasswordStrength(password);
    if (score < 41) {
        showNotification(`Password is too weak (${level}). Please use a stronger password (minimum: FAIR)`, 'error');
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
// PASSWORD STRENGTH ANALYZER
// ============================================

// Common password patterns and weak passwords
const COMMON_PASSWORDS = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
    'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
    'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
    'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang'
];

const COMMON_PATTERNS = [
    /^(.)\1+$/, // Repeated characters (aaa, 111)
    /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i, // Sequential
    /^[a-z]+$/i, // Only letters
    /^[0-9]+$/, // Only numbers
    /^(19|20)\d{2}$/ // Years
];

// Dictionary of common words (simplified)
const DICTIONARY_WORDS = [
    'admin', 'user', 'login', 'access', 'system', 'computer', 'internet',
    'welcome', 'hello', 'world', 'secret', 'private', 'secure', 'pass'
];

// Calculate password strength (0-100)
function calculatePasswordStrength(password) {
    if (!password) return { score: 0, level: 'VERY WEAK', feedback: [] };
    
    let score = 0;
    const feedback = [];
    const criteria = {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        noCommon: false,
        noPatterns: false,
        noDictionary: false
    };
    
    // Length check (25 points max)
    if (password.length >= 8) {
        criteria.length = true;
        score += 10;
        if (password.length >= 12) score += 5;
        if (password.length >= 16) score += 5;
        if (password.length >= 20) score += 5;
    } else {
        feedback.push('Use at least 8 characters (12+ recommended)');
    }
    
    // Character variety (40 points max - 10 each)
    if (/[A-Z]/.test(password)) {
        criteria.uppercase = true;
        score += 10;
    } else {
        feedback.push('Add uppercase letters (A-Z)');
    }
    
    if (/[a-z]/.test(password)) {
        criteria.lowercase = true;
        score += 10;
    } else {
        feedback.push('Add lowercase letters (a-z)');
    }
    
    if (/[0-9]/.test(password)) {
        criteria.numbers = true;
        score += 10;
    } else {
        feedback.push('Add numbers (0-9)');
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
        criteria.symbols = true;
        score += 10;
    } else {
        feedback.push('Add special symbols (!@#$%^&*)');
    }
    
    // Check for common passwords (15 points)
    const lowerPassword = password.toLowerCase();
    let isCommon = COMMON_PASSWORDS.some(common => lowerPassword.includes(common));
    if (!isCommon) {
        criteria.noCommon = true;
        score += 15;
    } else {
        feedback.push('Avoid common passwords');
        score = Math.min(score, 40); // Cap at Fair if common password detected
    }
    
    // Check for patterns (10 points)
    let hasPattern = COMMON_PATTERNS.some(pattern => pattern.test(password));
    if (!hasPattern) {
        criteria.noPatterns = true;
        score += 10;
    } else {
        feedback.push('Avoid sequential or repeated characters');
    }
    
    // Check for dictionary words (10 points)
    let hasDictionaryWord = DICTIONARY_WORDS.some(word => lowerPassword.includes(word));
    if (!hasDictionaryWord) {
        criteria.noDictionary = true;
        score += 10;
    } else {
        feedback.push('Avoid common dictionary words');
    }
    
    // Determine strength level
    let level;
    if (score <= 20) level = 'VERY WEAK';
    else if (score <= 40) level = 'WEAK';
    else if (score <= 60) level = 'FAIR';
    else if (score <= 80) level = 'GOOD';
    else level = 'VERY STRONG';
    
    return { score, level, feedback, criteria };
}

// Estimate crack time
function estimateCrackTime(password) {
    const length = password.length;
    let charset = 0;
    
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^A-Za-z0-9]/.test(password)) charset += 32;
    
    // Approximate combinations
    const combinations = Math.pow(charset, length);
    
    // Assume 1 billion guesses per second (modern GPU)
    const secondsToCrack = combinations / 1000000000;
    
    if (secondsToCrack < 1) return 'Instant';
    if (secondsToCrack < 60) return `${Math.ceil(secondsToCrack)} seconds`;
    if (secondsToCrack < 3600) return `${Math.ceil(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.ceil(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 2592000) return `${Math.ceil(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000) return `${Math.ceil(secondsToCrack / 2592000)} months`;
    return `${Math.ceil(secondsToCrack / 31536000)} years`;
}

// Signup password strength checker
function checkSignupPasswordStrength() {
    const passwordInput = document.getElementById('signup-password');
    const strengthMeter = document.getElementById('signup-strength-meter');
    const strengthBar = document.getElementById('signup-strength-bar');
    const strengthLabel = document.getElementById('signup-strength-label');
    const strengthPercent = document.getElementById('signup-strength-percent');
    const strengthSuggestions = document.getElementById('signup-strength-suggestions');
    
    if (!passwordInput || !strengthMeter) return;
    
    const password = passwordInput.value;
    
    if (!password) {
        strengthMeter.style.display = 'none';
        return;
    }
    
    strengthMeter.style.display = 'block';
    
    const { score, level, feedback } = calculatePasswordStrength(password);
    
    // Update bar
    strengthBar.className = 'strength-bar ' + level.toLowerCase().replace(' ', '-');
    
    // Update label and percent
    strengthLabel.textContent = level;
    strengthLabel.className = level.toLowerCase().replace(' ', '-');
    strengthPercent.textContent = score + '%';
    
    // Update suggestions
    if (feedback.length > 0) {
        strengthSuggestions.innerHTML = '<ul>' + 
            feedback.map(f => `<li>${f}</li>`).join('') + 
            '</ul>';
    } else {
        strengthSuggestions.innerHTML = '<span style="color: var(--primary-color);">✓ Excellent password!</span>';
    }
}

// Main password strength analyzer
function analyzePasswordStrength() {
    const passwordInput = document.getElementById('strength-password-input');
    const analysisDiv = document.getElementById('strength-analysis');
    
    if (!passwordInput || !analysisDiv) return;
    
    const password = passwordInput.value;
    
    if (!password) {
        analysisDiv.style.display = 'none';
        return;
    }
    
    analysisDiv.style.display = 'block';
    
    const { score, level, feedback, criteria } = calculatePasswordStrength(password);
    const crackTime = estimateCrackTime(password);
    
    // Update main strength bar
    const strengthBar = document.getElementById('strength-bar-main');
    const strengthScore = document.getElementById('strength-score-display');
    const strengthLevel = document.getElementById('strength-level-main');
    const crackTimeDisplay = document.getElementById('crack-time-display');
    
    strengthBar.className = 'strength-bar-main ' + level.toLowerCase().replace(' ', '-');
    strengthScore.textContent = score + '%';
    strengthLevel.textContent = level;
    strengthLevel.className = 'strength-level ' + level.toLowerCase().replace(' ', '-');
    crackTimeDisplay.textContent = 'Crack time: ' + crackTime;
    
    // Update criteria checklist
    const criteriaList = document.getElementById('criteria-list');
    criteriaList.innerHTML = `
        <div class="criterion ${criteria.length ? 'met' : 'unmet'}">
            <span class="criterion-icon">${criteria.length ? '✓' : '✗'}</span>
            <span>8+ characters</span>
        </div>
        <div class="criterion ${criteria.uppercase ? 'met' : 'unmet'}">
            <span class="criterion-icon">${criteria.uppercase ? '✓' : '✗'}</span>
            <span>Uppercase letters</span>
        </div>
        <div class="criterion ${criteria.lowercase ? 'met' : 'unmet'}">
            <span class="criterion-icon">${criteria.lowercase ? '✓' : '✗'}</span>
            <span>Lowercase letters</span>
        </div>
        <div class="criterion ${criteria.numbers ? 'met' : 'unmet'}">
            <span class="criterion-icon">${criteria.numbers ? '✓' : '✗'}</span>
            <span>Numbers</span>
        </div>
        <div class="criterion ${criteria.symbols ? 'met' : 'unmet'}">
            <span class="criterion-icon">${criteria.symbols ? '✓' : '✗'}</span>
            <span>Special characters</span>
        </div>
        <div class="criterion ${criteria.noCommon ? 'met' : 'unmet'}">
            <span class="criterion-icon">${criteria.noCommon ? '✓' : '✗'}</span>
            <span>Not common password</span>
        </div>
        <div class="criterion ${criteria.noPatterns ? 'met' : 'unmet'}">
            <span class="criterion-icon">${criteria.noPatterns ? '✓' : '✗'}</span>
            <span>No patterns</span>
        </div>
        <div class="criterion ${criteria.noDictionary ? 'met' : 'unmet'}">
            <span class="criterion-icon">${criteria.noDictionary ? '✓' : '✗'}</span>
            <span>No dictionary words</span>
        </div>
    `;
    
    // Update suggestions
    const suggestionsDiv = document.getElementById('strength-suggestions-main');
    const suggestionsList = document.getElementById('suggestions-list');
    
    if (feedback.length > 0) {
        suggestionsDiv.style.display = 'block';
        suggestionsList.innerHTML = feedback.map(f => 
            `<div class="suggestion-item">${f}</div>`
        ).join('');
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

// Analyze and save to history
async function analyzeAndSave() {
    const passwordInput = document.getElementById('strength-password-input');
    const password = passwordInput.value;
    
    if (!password) {
        showNotification('Please enter a password to analyze', 'warning');
        return;
    }
    
    // Trigger analysis
    analyzePasswordStrength();
    
    // Save to Firebase history
    if (auth && auth.currentUser && database) {
        try {
            const { score, level } = calculatePasswordStrength(password);
            const crackTime = estimateCrackTime(password);
            
            // Use same pattern as breach checker history
            const historyRef = database.ref(`users/${auth.currentUser.uid}/strength_history`);
            await historyRef.push({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                strength_level: level,
                strength_score: score,
                crack_time: crackTime,
                password_length: password.length
            });
            
            showNotification('Password analyzed and saved to history!', 'success');
        } catch (error) {
            console.error('Error saving to history:', error);
            showNotification('Password analyzed (not saved - Firebase error)', 'warning');
        }
    } else {
        showNotification('Password analyzed!', 'success');
    }
}

// Toggle password visibility in strength analyzer
function toggleStrengthPasswordVisibility() {
    const passwordInput = document.getElementById('strength-password-input');
    const toggleBtn = document.getElementById('strength-toggle-visibility');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Password generator
function generatePassword() {
    const length = parseInt(document.getElementById('password-length').value);
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    
    // Validate at least one type is selected
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        showNotification('Please select at least one character type', 'warning');
        return;
    }
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Display generated password
    const container = document.getElementById('generated-password-container');
    const passwordDisplay = document.getElementById('generated-password');
    const strengthInfo = document.getElementById('generated-strength');
    
    container.style.display = 'block';
    passwordDisplay.textContent = password;
    
    // Analyze generated password
    const { score, level } = calculatePasswordStrength(password);
    const crackTime = estimateCrackTime(password);
    
    strengthInfo.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: var(--primary-color); font-weight: bold;">Strength: ${level}</span>
            <span style="color: var(--text-dim);">${score}%</span>
        </div>
        <div style="color: var(--text-dim); font-size: 12px;">
            Estimated crack time: ${crackTime}
        </div>
    `;
    
    showNotification('Password generated successfully!', 'success');
}

// Copy generated password
function copyGeneratedPassword() {
    const passwordDisplay = document.getElementById('generated-password');
    const password = passwordDisplay.textContent;
    
    navigator.clipboard.writeText(password).then(() => {
        showNotification('Password copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy password', 'error');
    });
}

// Update length display
function updateLengthDisplay() {
    const lengthInput = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    lengthValue.textContent = lengthInput.value;
}

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
