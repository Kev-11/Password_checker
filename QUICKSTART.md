# ⚡ Quick Start - 5 Minutes Setup

## Step 1: Run Setup Script

```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh && ./setup.sh
```

This creates virtual environment and installs dependencies.

---

## Step 2: Configure Firebase (2 minutes)

### A. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it → Create

### B. Enable Authentication
1. Click **Authentication** → Get Started
2. Enable **Email/Password** (toggle ON)
3. (Optional) Enable **Google**
4. **Settings** tab → Add domain: `localhost`

### C. Enable Database
1. Click **Realtime Database** → Create Database
2. Choose location → **Test mode** → Enable
3. **Rules** tab → Paste this:
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
4. Click **Publish**

### D. Get Config
1. ⚙️ Project Settings → General
2. Scroll to "Your apps" → Web icon (</>)
3. Copy config values
4. Open `.env` file and fill in:
```env
FIREBASE_API_KEY=paste_here
FIREBASE_AUTH_DOMAIN=paste_here
FIREBASE_PROJECT_ID=paste_here
FIREBASE_STORAGE_BUCKET=paste_here
FIREBASE_MESSAGING_SENDER_ID=paste_here
FIREBASE_APP_ID=paste_here
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### E. Generate Flask Secret
```bash
python -c "import secrets; print('FLASK_SECRET_KEY=' + secrets.token_hex(32))"
```
Copy output to `.env`

---

## Step 3: Run App

```bash
# Activate environment (if not already)
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Run
python app.py
```

Open: **http://localhost:5000**

---

## ✅ Done! Now You Can:

1. **Register** an account
2. **Check** passwords
3. **View** history & stats
4. **Try** Google Sign-In

---

## 🐛 Issues?

**Port in use:** Edit `app.py`, change `port=5000` to `port=5001`

**Firebase errors:** Check all `.env` values are filled

**Script errors (Windows):** Run as Admin:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**More help:** See [README.md](README.md)

---

**That's it! 🎉 Your password checker is ready!**
