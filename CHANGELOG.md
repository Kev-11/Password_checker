# 📝 Changelog

All notable changes to this project.

---

## [2.1.0] - 2026-01-10

### 🔄 Changed
- **Removed Docker**: Simplified deployment to focus on Vercel cloud hosting
- **Updated DEPLOYMENT.md**: Now Vercel-only guide with comprehensive instructions
- **Updated README.md**: Removed Docker references, updated folder structure
- **Streamlined Setup**: One deployment method for easier onboarding

### 🗑️ Removed
- `Dockerfile` - Docker image configuration
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Docker ignore rules
- Docker sections from all documentation

### 📚 Improved
- **DEPLOYMENT.md**: Complete Vercel guide with troubleshooting, custom domains, monitoring
- **Folder Structure**: Updated README to reflect current project files
- **Documentation**: Clearer, more focused on single deployment path

---

## [2.0.0] - 2026-01-10

### ✨ Added

#### 🎨 Theme Selector
- **5 Cyberpunk Themes**: Matrix Green (default), Cyber Blue, Neon Purple, Hacker Red, Amber Alert
- **Dynamic Theme Switcher**: Click 🎨 icon in header to change themes
- **Persistent Storage**: Theme preference saved in localStorage
- **CSS Variables**: Centralized theming system using CSS custom properties
- **Smooth Transitions**: All colors transition smoothly when switching themes

**Files Modified:**
- `templates/index.html` - Added theme selector UI with dropdown menu
- `static/css/style.css` - Implemented CSS variables and 5 theme variations
- `static/js/app.js` - Added theme management functions (loadTheme, changeTheme, toggleThemeMenu)

#### 🚀 Vercel Deployment
- **vercel.json**: Configuration for Vercel serverless deployment
- **Environment Variables**: Support for production environment configuration
- **Automatic Builds**: CI/CD integration with Git repositories
- **Free Tier**: Deploy to cloud hosting for free

**Files Added:**
- `vercel.json` - Vercel configuration (builds, routes, environment)

#### 📚 Documentation
- **DEPLOYMENT.md**: Comprehensive Vercel deployment guide
  - Vercel deployment (2 methods: web dashboard + CLI)
  - Environment variables setup
  - Custom domain configuration
  - Monitoring and analytics
  - Production checklist
  - Troubleshooting guide
- **README.md Updates**: 
  - Added theme selector section
  - Added deployment quick start
  - Updated features list
  - Updated folder structure
- **CHANGELOG.md**: This file to track all changes

**Files Added/Modified:**
- `DEPLOYMENT.md` - Full Vercel deployment guide
- `README.md` - Updated with new features
- `CHANGELOG.md` - Version tracking

---

## [1.0.0] - 2026-01-09

### Initial Release

#### Features
- 3D Kali Linux cyberpunk interface with matrix rain effect
- Firebase Authentication (Email/Password + Google Sign-In)
- Password breach checking via HaveIBeenPwned API
- Real-time history tracking in Firebase Realtime Database
- Statistics dashboard (total scans, breached, secure)
- Remember me functionality
- Delete account with double confirmation
- Responsive design for all devices
- Privacy-first approach (passwords never stored)

#### Files
- `app.py` - Flask backend server
- `templates/index.html` - Main UI
- `static/css/style.css` - Cyberpunk theme styles
- `static/js/app.js` - Firebase integration and client logic
- `requirements.txt` - Python dependencies
- `setup.bat` / `setup.sh` - Automated setup scripts
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- `README.md` - Project documentation
- `QUICKSTART.md` - 5-minute setup guide

---

## 🔮 Future Roadmap

### Planned Features
- [ ] Password strength analyzer with visual feedback
- [ ] Two-factor authentication (2FA) support
- [ ] Dark/Light mode toggle (in addition to color themes)
- [ ] Export history as CSV/JSON
- [ ] Password generator with customizable rules
- [ ] Mobile app (React Native)
- [ ] Browser extension for quick checks
- [ ] Multi-language support (i18n)
- [ ] API rate limiting and caching
- [ ] User analytics dashboard
- [ ] Social sharing for secure password tips

### Under Consideration
- GraphQL API endpoint
- WebSocket for real-time notifications
- Redis caching layer
- Kubernetes deployment files
- CI/CD pipelines (GitHub Actions)
- End-to-end testing with Playwright
- Performance monitoring with Sentry

---

## 📊 Statistics

- **Total Files**: 18
- **Total Lines of Code**: ~3,500
- **Languages**: Python, JavaScript, HTML, CSS
- **Dependencies**: 7 Python packages
- **Deployment Options**: 3 (Local, Vercel, Docker)
- **Themes**: 5
- **Features**: 12+

---

**Version Format**: [Major].[Minor].[Patch]
- **Major**: Breaking changes or major new features
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, minor improvements

**Last Updated**: January 10, 2026
