# GitHub Deployment Guide

Follow these steps to push your project to a new GitHub repository:

### 1. Initialize Local Repository
Run these commands in your project root (`c:\Users\manoa\OneDrive\Desktop\FTS`):
```powershell
git init
git add .
git commit -m "Initial commit: Academic Vault Integration"
```

### 2. Create Repository on GitHub
1. Go to [github.com/new](https://github.com/new)
2. Name your repository (e.g., `academic-vault`)
3. Keep it Public or Private as per your preference.
4. **DO NOT** initialize with a README, license, or gitignore (we already have them).

### 3. Connect and Push
Copy the commands from GitHub's "push an existing repository from the command line" section, or run:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

> [!IMPORTANT]
> Change `YOUR_USERNAME` and `YOUR_REPO_NAME` to your actual GitHub details.
