@echo off
color 0a
cls
echo ===================================================
echo   EMERGENCY DIRECT DEPLOYMENT SYSTEM
echo   BYPASSING GITHUB... DIRECT UPLOAD TO VERCEL CDN
echo ===================================================
echo.
echo [1/3] Navigating to App Directory...
cd app

echo.
echo [2/3] Initiating Direct Upload (Production)...
echo       If asked to log in, please follow the prompts.
echo       If asked "Set up and deploy?", say Y.
echo       If asked "Which scope?", select your account.
echo       If asked "Link to existing project?", say Y.
echo.
call npx vercel --prod
echo.

echo [3/3] Deployment Request Sent.
echo       Check the URL printed above.
echo.
pause
