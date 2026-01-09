# 🔐 SecureCheck - Password Breach Scanner

A **3D Kali Linux-themed** web application for checking passwords against known data breaches using the HaveIBeenPwned API. Features Firebase authentication, real-time history tracking, and a cyberpunk-inspired interface with matrix effects.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- 🎨 **5 Cyberpunk Themes** - Matrix Green, Cyber Blue, Neon Purple, Hacker Red, Amber Alert
- 🔐 **Firebase Authentication** - Email/Password + Google Sign-In
- 📊 **Real-time Database** - Store and track password check history
- 🔍 **Password Breach Detection** - Check against 10+ billion pwned passwords
- 📈 **Statistics Dashboard** - Track total scans, breached, and secure passwords
- 🎭 **Animated UI** - 3D rotating cube logo, matrix rain effect, glowing effects
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🛡️ **Privacy First** - Passwords are never stored, only check results
- 💾 **Remember Me** - Optional persistent login sessions
- 🗑️ **Account Deletion** - Full GDPR-compliant account removal
- 🚀 **Cloud Ready** - Deploy to Vercel in 5 minutes

## 🖼️ Preview

```
┌──[AUTHENTICATION]──────────────────────────────────┐
│ root@securecheck:~$ EMAIL_ADDRESS                  │
│ root@securecheck:~$ PASSWORD                       │
│                                                     │
│         [ AUTHENTICATE ]                           │
└─────────────────────────────────────────────────────┘

┌──[PASSWORD_SCANNER]────────────────────────────────┐
│ root@securecheck:~$ initiate_breach_scan           │
│ >> [Enter Password]          🔍 EXECUTE SCAN       │
│                                                     │
│ ✅ PASSWORD SECURE                                 │
│ Good news! This password has NOT been found...     │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh && ./setup.sh
```

Then configure Firebase (see below) and run:
```bash
python app.py
```

### Manual Setup

1. **Create virtual environment:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure Firebase:**
```bash
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

4. **Run:**
```bash
python app.py
```

Open: **http://localhost:5000**

## 🎨 Changing Themes

Click the **🎨** icon in the top-right corner to choose from 5 cyberpunk themes:
- **Matrix Green** - Classic Kali Linux hacker theme (default)
- **Cyber Blue** - Ocean-inspired neon blue
- **Neon Purple** - Futuristic purple vibes
- **Hacker Red** - Danger zone aesthetic
- **Amber Alert** - Warm orange glow

Your theme preference is saved automatically in browser storage!

## 📁 Project Structure

```
Password_checker/
├── venv/                      # Virtual environment
├── static/
│   ├── css/
│   │   └── style.css         # 3D Kali-themed styles (5 themes)
│   └── js/
│       └── app.js            # Firebase & interactions
├── templates/
│   └── index.html            # Main UI template
├── app.py                    # Flask backend server
├── requirements.txt          # Python dependencies
├── vercel.json               # Vercel deployment config
├── setup.bat                 # Windows setup script
├── setup.sh                  # Mac/Linux setup script
├── .env                      # Environment variables (not in Git)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── QUICKSTART.md             # 5-minute setup guide
├── DEPLOYMENT.md             # Vercel deployment guide
└── CHANGELOG.md              # Version history
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Flask Configuration
FLASK_Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Enter name → Create
3. **Enable Authentication:**
   - Click Authentication → Get Started
   -Authentication

**Email/Password:**
- Register: Create account with email/password
- Login: Enter credentials
- ✅ Remember Me: Check box to stay logged in

**Google Sign-In:**
- Click "SIGN IN WITH GOOGLE" button
- Select your Google account
- Instant authentication

### Password Checking

1. Enter password in scanner terminal
2. Click "EXECUTE SCAN" or press Enter
3. View result instantly:
   - ✅ **SECURE**: Not found in breaches
   - ⚠️ **COMPROMISED**: Found in X breaches

### History & Stats
Email addresses (authentication only)
- ✅ Check results (pwned/safe, count, timestamp)
- ✅ User statistics
- ❌ **NEVER actual passwords**

### How It Works (k-Anonymity)
1. Password → SHA-1 hash (client-side)
2. Send only first 5 chars to API
3. API returns ~500 matching hashes
4. Compare locally to find exact match
5. Save only result to Firebase

**Example:**
- Password: "password123"
- SHA-1: `482C811DA5D5B4BC6D497FFA98491E38`
- Send to API: `482C8` (first 5 only)
- Your actual password never leaves your device!

### Firebase Security
- User data isolated by UID
- Read/write only to own data
- Authentication required
- OAuth 2.0 for Google Sign-In
FLASK_ENV=development
```

### Database URL Location:
- Realtime Database page → Top of Data tab
- Format: `https://your-project-id-default-rtdb.firebaseio.com`
- Statistics update in real-time

### 4. Clear History
- Click "[CLEAR]" button in history panel
- Confirm deletion

## 🛡️ Security & Privacy

### What We Store
- ✅ User email addresses (for authentication)
- ✅ Password check results (pwned/safe, count, timestamp)
- ❌ **NEVER store actual passwords**

### How It Works
1. Password is hashed using SHA-1 locally
2. Only first 5 characters of hash sent to HaveIBeenPwned API
3. API returns matching hashes (k-anonymity)
4. Local comparison to determine if password is pwned
5. Only result (not password) saved to Firebase

### Firebase Security Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

See [FIREBASE_DATABASE.md](FIREBASE_DATABASE.md) for complete security setup.

## 🎨 Customization

### Change Theme Colors

Edit `static/css/style.css`:

```css
:root {
    --cyber-green: #00ff41;    /* Matrix green */
    --cyber-blue: #00d9ff;     /* Neon blue */
    --cyber-red: #ff0055;      /* Alert red */
    --cyber-purple: #b537f2;   /* Accent purple */
}
```

### Modify Animations

Adjust animation speeds and effects in CSS:

```css
@keyframes rotateCube {
    frTechnical Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- 3D CSS transforms & animations
- Canvas API (matrix background)
- Firebase SDK (Auth, Database)

**Backend:**
- Python 3.8+
- Flask 3.0
- HaveIBeenPwned API v3
- python-dotenv

**Database & Auth:**
- Firebase Authentication (Email + Google OAuth)
- Firebase Realtime Database
- Session persistence
- User-scoped security rulesation (email/password)
- ✅ Realtime database
- ✅ Password check history
- ✅ User statistics
- ✅ Common Issues

| Issue | Solution |
|-------|----------|
| Python not found | Install from [python.org](https://www.python.org/) |
| Scripts disabled (Windows) | Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Module not found | `pip install -r requirements.txt` |
| Port 5000 in use | Change port in app.py: `app.run(port=5001)` |
| Firebase not initialized | Check `.env` has all Firebase values filled |
| Can't register/login | Enable Email/Password in Firebase Console |
| History not saving | Update Firebase database rules (see config above) |
| Google sign-in fails | Add `localhost` to authorized domains in Firebase |
| "Permission denied" | Check database rules are set correctly |

### Generate Flask Secret Key
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Check Logs
Press **F12** in browser → Console tab to see error
## 📚 Additional Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase configuration guide
- [FIREBASE_DATABASE.md](FIREBASE_DATABASE.md) - Database structure and rules

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- 🎨 Additional themes (e.g., dark blue, purple haze)
- 🔐 Two-factor authentication
- 📊 Advanced analytics
- 🌐 Multi-language support
- 📱 Progressive Web App (PWA) features
- 🔔 Email notifications for breached passwords

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [HaveIBeenPwned API](https://haveibeenpwned.com/) - Troy Hunt's amazing service
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- Kali Linux - Design inspiration

## 📞 Support

Having issues? Check these resources:

1. [SETUP.md](SETUP.md) - Setup guide
2. [GitHub Issues](https://github.com/yourusername/password_checker/issues) - Report bugs
3. [Firebase Docs](https://firebase.google.com/docs) - Firebase help

## 🔮 Future Enhancements

- [ ] Password strength meter
- [ ] Common password patterns detection
- [ ] Export history to CSV
- [ ] Dark/Light theme toggle
- [ ] Browser extension
- [ ] API rate limiting
- [ ] Captcha integration
- [ ] Social authentication (Google, GitHub)
- [ ] Password generator
- [ ] Breach notification system

---

**⚠️ Disclaimer:** This tool is for educational and security awareness purposes. Always use strong, unique passwords for each account. Consider using a reputable password manager.

**Made with 💚 and ☕ by Kevin Patel**

🌟 If you find this project useful, please consider giving it a star!
� Support

**Need help?**
1. Check Troubleshooting section above
2. Press F12 → Console tab for error details
3. Verify Firebase configuration
4. Check [QUICKSTART.md](QUICKSTART.md) for quick setup

**Resources:**
- [Firebase Documentation](https://firebase.google.com/docs)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

## � Deployment

Ready to share your app with the world? Deploy to **Vercel** for free!

### Vercel Cloud Hosting
-  Deploy in 5 minutes
-  Free tier available
-  Automatic HTTPS and CDN
-  Simple Git integration
-  Auto-deploy on push
-  Environment variables support

**Quick Deploy:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy your app
vercel
```

**Step-by-Step:**
1. Push code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables (Firebase config)
5. Deploy!

 See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step guide!

---

## �📜 License

MIT License - Free to use and modify

---

**⚠️ Disclaimer:** Educational and security awareness tool. Always use strong, unique passwords for each account.

**🌟 Star if you find this useful**
