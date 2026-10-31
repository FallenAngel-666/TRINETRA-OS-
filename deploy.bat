@echo off
echo ========================================================
echo   TRINETRA OS - Git Commit & Push to GitHub / Vercel
echo ========================================================
cd /d "%~dp0"

echo [1/5] Initializing Git Repository...
git init

echo [2/5] Staging All Files for Deployment...
git add .

echo [3/5] Committing Changes...
git commit -m "first commit - TRINETRA OS Intelligent Campus System"

echo [4/5] Setting Main Branch...
git branch -M main

echo [5/5] Configuring Remote and Pushing to GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/FallenAngel-666/TRINETRA-OS-.git
git push -u origin main

echo ========================================================
echo   Done! Your repository is ready to import on Vercel.
echo ========================================================
pause