# 🚀 Vercel Deployment Guide

Complete guide for deploying your Password Checker app to Vercel cloud hosting.

---

## 📦 Table of Contents

- [What is Vercel?](#what-is-vercel)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Custom Domain](#custom-domain)
- [Troubleshooting](#troubleshooting)

---

## 🌐 What is Vercel?

**Vercel** is a cloud platform for hosting web applications with zero configuration. It's perfect for Flask apps!

### Why Vercel?

✅ **Free Tier**: Host your app for free  
✅ **Easy Deploy**: Push to Git → Auto-deploy  
✅ **Fast**: Global CDN for quick loading  
✅ **Secure**: Automatic HTTPS certificates  
✅ **Scalable**: Handles traffic spikes automatically  
✅ **No Server Management**: Focus on code, not infrastructure  

### Vercel vs Traditional Hosting

| Feature | Vercel | Traditional VPS |
|---------|--------|----------------|
| **Setup Time** | 5 minutes | Hours |
| **Cost** | Free tier | $5-20/month |
| **SSL/HTTPS** | Automatic | Manual setup |
| **Scaling** | Automatic | Manual |
| **Deployment** | Git push | FTP/SSH |
| **CDN** | Built-in | Extra cost |

---

## 🌐 Vercel Deployment

### Prerequisites
- [Vercel account](https://vercel.com/signup) (free)
- [Vercel CLI](https://vercel.com/download) (optional)
- Git repository (GitHub, GitLab, or Bitbucket)

### Method 1: Deploy via Vercel Website (Recommended)

1. **Push to Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository
   - Vercel will auto-detect the Flask app

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add these variables:
     ```
     FIREBASE_API_KEY=your_api_key
     FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     FIREBASE_APP_ID=your_app_id
     FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
     FLASK_SECRET_KEY=your_secret_key
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

5. **Update Firebase Settings**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain to "Authorized domains"
   - Example: `your-project.vercel.app`

### Method 2: Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - First deployment creates a preview
   - Run `vercel --prod` for production

4. **Set Environment Variables**
   ```bash
   vercel env add FIREBASE_API_KEY
   vercel env add FLASK_SECRET_KEY
   # ... add all other variables
   ```

### Vercel Configuration

The `vercel.json` file configures:
- **Build**: Uses Python runtime
- **Routes**: All requests go to Flask app
- **Environment**: Production mode

```json
{
  "version": 2,
  "builds": [{"src": "app.py", "use": "@vercel/python"}],
  "routes": [{"src": "/(.*)", "dest": "app.py"}]
}
```

---

## 🐳 Docker Usage

### What is Docker?

**Docker** is a containerization platform that packages your application with all its dependencies into a standardized unit called a "container."

#### Why Use Docker?

✅ **Consistency**: "It works on my machine" → "It works everywhere"  
✅ **Isolation**: App runs in its own environment, no conflicts  
✅ **Portability**: Run anywhere - Windows, Mac, Linux, cloud  
✅ **Easy deployment**: One command to start everything  
✅ **Version control**: Track different versions of your app  
✅ **Scalability**: Easy to run multiple instances

#### Docker Concepts

- **Image**: Blueprint/template for your app (like a recipe)
- **Container**: Running instance of an image (like a cake from the recipe)
- **Dockerfile**: Instructions to build an image
- **Docker Compose**: Tool to run multi-container apps

### Installation

#### Windows
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Run installer
3. Restart computer
4. Open Docker Desktop

#### Mac
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. Drag to Applications
3. Open Docker Desktop

#### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

### Using Docker with Your App

#### Method 1: Docker Compose (Recommended)

**Simple, one-command deployment:**

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

Your app runs at `http://localhost:5000`

#### Method 2: Manual Docker Commands

```

---

## 🔐 Environment Variables

### Required Variables

You need to set these environment variables in Vercel for your app to work:

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FLASK_SECRET_KEY=your_secret_key_here
```

### How to Find Firebase Values

1. **Firebase Console**: Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Project Settings**: Click gear icon → Project settings
3. **Your apps**: Scroll to "Your apps" section
4. **Config**: Copy the config values
5. **Database URL**: Go to Realtime Database → top of Data tab

### Generate Flask Secret Key

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Setting Variables in Vercel

**Via Dashboard:**
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add each variable name and value
4. Select "Production" environment
5. Click "Save"

**Via CLI:**
```bash
vercel env add FIREBASE_API_KEY production
vercel env add FLASK_SECRET_KEY production
# ... repeat for all variables
```

---

## 🌐 Custom Domain

### Add Your Own Domain

1. **Buy a Domain**: GoDaddy, Namecheap, Google Domains, etc.
2. **Vercel Dashboard**: Go to your project → Settings → Domains
3. **Add Domain**: Enter your domain name
4. **Configure DNS**: Follow Vercel's instructions to update nameservers
5. **Wait**: DNS propagation takes 5-60 minutes

**Vercel provides:**
- Automatic SSL certificate
- Global CDN
- Free bandwidth

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: Build fails
- **Solution**: Check Vercel build logs
- Ensure all dependencies in `requirements.txt`
- Verify Python version compatibility

**Problem**: Application error (500)
- **Solution**: Check Vercel Function logs
- Verify environment variables are set correctly
- Check Flask secret key is present

**Problem**: Firebase authentication not working
- **Solution**: Add Vercel domain to Firebase authorized domains
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add: `your-project.vercel.app`

**Problem**: "Module not found" error
- **Solution**: Add missing package to `requirements.txt`
- Redeploy after updating

**Problem**: Database permissions error
- **Solution**: Update Firebase Realtime Database rules:
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

### Debugging Tips

1. **Check Logs**: Vercel dashboard → Deployments → Click deployment → View Function Logs
2. **Test Locally First**: Run `python app.py` to verify it works
3. **Environment Variables**: Double-check all values are correct
4. **Firebase Console**: Check Authentication and Database sections
5. **Browser Console**: Press F12 to see JavaScript errors

### Getting Help

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Flask Docs**: [flask.palletsprojects.com](https://flask.palletsprojects.com/)

---

## 📊 Monitoring Your App

### Vercel Analytics

**Free tier includes:**
- Page views
- Top pages
- Referrers
- Devices/browsers

**Enable:**
1. Vercel Dashboard → Analytics
2. Install Vercel Analytics package (optional)

### Performance

**Vercel automatically provides:**
- Global CDN (fast loading worldwide)
- Automatic compression
- Image optimization
- Edge caching

---

## 🔄 Updating Your App

### Automatic Deployments

If connected to Git:
```bash
# Make changes to your code
git add .
git commit -m "Updated feature"
git push

# Vercel automatically deploys! 🎉
```

### Manual Deployment

```bash
# Using CLI
vercel --prod

# Or push to Git and deploy via dashboard
```

### Rollback

If something breaks:
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click three dots → Promote to Production

---

## 🎯 Production Checklist

Before going live, ensure:

- [ ] All environment variables set in Vercel
- [ ] Firebase authorized domains include Vercel URL
- [ ] Firebase Authentication methods enabled
- [ ] Firebase Database rules configured
- [ ] Custom domain configured (optional)
- [ ] Test all features (login, password check, history)
- [ ] Check mobile responsiveness
- [ ] Test all 5 themes
- [ ] Verify Google Sign-In works
- [ ] Test account deletion

---

## 📈 Scaling

Vercel automatically scales your app:
- **Traffic spikes**: Handled automatically
- **Global users**: CDN serves from nearest location
- **No downtime**: Zero-downtime deployments

**Free tier limits:**
- 100 GB bandwidth/month
- 100 GB-hours serverless function execution
- Unlimited deployments

**Upgrade for:**
- More bandwidth
- Faster builds
- Team collaboration
- Priority support

---

## 🎉 Success!

Your Password Checker app is now live on Vercel! 

**Share your deployment:**
- `https://your-project.vercel.app`
- Add to portfolio
- Share with friends
- Post on social media

**Next steps:**
- Add custom domain
- Enable analytics
- Monitor usage
- Gather feedback
- Add new features

---

**Built with 💚 by you, hosted by Vercel** ⚡

# Run the container
docker run -d \
  --name password_checker \
  -p 5000:5000 \
  --env-file .env \
  password-checker

# View logs
docker logs -f password_checker

# Stop container
docker stop password_checker

# Remove container
docker rm password_checker
```

### Docker Commands Cheat Sheet

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# List images
docker images

# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -a -q)

# Remove all images
docker rmi $(docker images -q)

# View container resource usage
docker stats

# Execute command in running container
docker exec -it password_checker bash

# View container logs (last 100 lines)
docker logs --tail 100 password_checker

# Restart container
docker restart password_checker

# Rebuild without cache
docker-compose build --no-cache
```

### Docker Compose Configuration

**docker-compose.yml** simplifies deployment:

```yaml
services:
  password-checker:
    build: .                          # Build from Dockerfile
    ports:
      - "5000:5000"                   # Map port 5000 to host
    volumes:
      - ./.env:/app/.env:ro           # Mount .env file (read-only)
    restart: unless-stopped           # Auto-restart on crash
```

### Dockerfile Explained

```dockerfile
# Start with Python 3.11 base image (lightweight)
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy and install Python packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application files
COPY . .

# Expose port 5000 to outside world
EXPOSE 5000

# Run the Flask app when container starts
CMD ["python", "app.py"]
```

### Benefits for Your Project

1. **Easy Testing**: Test different configurations without breaking your local setup
2. **Team Collaboration**: Everyone runs the same environment
3. **Production Ready**: Same container works in development and production
4. **Quick Rollback**: If something breaks, revert to previous image
5. **No Dependency Hell**: All dependencies packaged together

### Docker vs Vercel

| Feature | Docker | Vercel |
|---------|--------|--------|
| **Hosting** | Self-hosted | Cloud-hosted |
| **Cost** | Free (your server) | Free tier available |
| **Control** | Full control | Limited control |
| **Setup** | More complex | Very simple |
| **Scaling** | Manual | Automatic |
| **Best For** | Full control, local dev | Quick deployment, production |

---

## 🔐 Environment Variables

### For Vercel

Set in dashboard or via CLI:

```bash
vercel env add FIREBASE_API_KEY production
vercel env add FLASK_SECRET_KEY production
```

### For Docker

Create `.env` file (already done if you followed setup):

```env
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FLASK_SECRET_KEY=your_secret_key_here
```

**Security Note**: Never commit `.env` to Git! The `.gitignore` file already excludes it.

---

## 🐛 Troubleshooting

### Vercel Issues

**Problem**: "Build failed"
- **Solution**: Check Vercel logs, ensure all dependencies in `requirements.txt`

**Problem**: "Application error"
- **Solution**: Check environment variables are set correctly

**Problem**: Firebase auth not working
- **Solution**: Add Vercel domain to Firebase authorized domains

### Docker Issues

**Problem**: "Cannot connect to Docker daemon"
- **Solution**: Start Docker Desktop / Docker service

**Problem**: "Port 5000 already in use"
- **Solution**: Stop other apps using port 5000 or change port:
  ```yaml
  ports:
    - "8080:5000"  # Use port 8080 instead
  ```

**Problem**: "Container exits immediately"
- **Solution**: Check logs: `docker logs password_checker`

**Problem**: ".env file not found"
- **Solution**: Ensure `.env` file exists in project root

**Problem**: "Permission denied"
- **Solution (Linux)**: Add user to docker group:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

### General Tips

1. **Check logs**: `docker logs -f <container>` or Vercel dashboard
2. **Verify environment variables**: Ensure all Firebase config is set
3. **Test locally first**: Run with `python app.py` before deploying
4. **Clear cache**: `docker-compose build --no-cache`
5. **Check Firebase console**: Ensure auth methods enabled

---

## 📊 Monitoring

### Vercel
- View logs in dashboard
- Analytics available on Pro plan
- Automatic error reporting

### Docker
```bash
# Real-time logs
docker-compose logs -f

# Container stats (CPU, memory)
docker stats

# Health check status
docker inspect password_checker | grep Health
```

---

## 🎯 Quick Start Commands

### Vercel
```bash
# One-time setup
vercel login
vercel

# Update deployment
git push origin main  # If connected to Git
# OR
vercel --prod
```

### Docker
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build
```

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Docker Docs**: https://docs.docker.com
- **Firebase Docs**: https://firebase.google.com/docs

---

**Your app is now production-ready! 🎉**

Choose Vercel for quick cloud deployment or Docker for full control and local hosting.
