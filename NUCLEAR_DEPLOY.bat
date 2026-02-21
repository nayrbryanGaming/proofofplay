@echo off
color 0a
cls
echo ===============================================================================
echo   NUCLEAR DEPLOYMENT - NO QUESTIONS ASKED
echo ===============================================================================
echo.
echo   [INFO] Auto-confirming all prompts.
echo   [INFO] Force uploading `app/out` to Vercel Production.
echo.
echo   DO NOT CLOSE THIS WINDOW.
echo   IT WILL OPEN THE WEBSITE AUTOMATICALLY WHEN DONE.
echo.
call npx vercel deploy --prod --yes
pause

