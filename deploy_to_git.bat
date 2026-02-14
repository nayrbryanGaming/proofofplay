@echo off
setlocal
title DEPLOY TO GITHUB (TRIGGER CI/CD)

echo ==================================================
echo   TRIGGERING GITHUB SYSTEM
echo   Target: GitHub Actions (CI/CD)
echo ==================================================
echo.

:: 1. Verify Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    pause
    exit /b
)

:: 2. Add All Changes
echo [1/3] Staging files...
git add .

:: 3. Commit
echo [2/3] Committing changes...
set /p commit_msg="Enter commit message (default: 'Final Release'): "
if "%commit_msg%"=="" set commit_msg=Final Release
git commit -m "%commit_msg%"

:: 4. Push
echo [3/3] Pushing to repository...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed.
    echo Possible reasons:
    echo 1. You haven't set 'git remote add origin <url>'
    echo 2. Network issues
    echo 3. Authentication issues
    echo.
    echo PLEASE FIX GIT REMOTE AND TRY AGAIN.
) else (
    echo.
    echo [SUCCESS] Code pushed to GitHub.
    echo [INFO] GitHub Actions CI/CD should now be RUNNING.
    echo.
)

pause
