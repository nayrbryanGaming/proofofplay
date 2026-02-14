@echo off
:loop
cls
echo Checking Vercel Status...
curl -I https://proofofplay.vercel.app
echo.
echo [INFO] A "HTTP/2 404" means it is still building.
echo [INFO] A "HTTP/2 200" means IT IS LIVE.
echo.
timeout /t 5
goto loop
