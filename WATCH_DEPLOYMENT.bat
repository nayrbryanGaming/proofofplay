@echo off
color 0e
cls
echo ==============================================================
echo   DEPLOYMENT WATCHDOG - CONNECTED TO VERCEL EDGE NETWORK
echo ==============================================================
echo.
echo   TARGET: https://proofofplay.vercel.app
echo   STATUS: MONITORING FOR REFRESH...
echo.

:loop
curl -I https://proofofplay.vercel.app | findstr "HTTP/2"
if %errorlevel% equ 0 (
    echo [ALIVE] Website is responding.
) else (
    echo [WAITING] Building... (Vercel is compiling Static Assets)
)
timeout /t 3 >nul
goto loop
