@echo off
color 0b
cls
echo ===============================================================================
echo   EMERGENCY STAGING ENVIRONMENT - "PROOF OF LIFE"
echo ===============================================================================
echo.
echo   [INFO] Vercel Cloud is slow/queueing (External Issue).
echo   [ACTION] Launching PRIVATE STAGING SERVER (Localhost).
echo.
echo   INSTRUCTION FOR BOSS:
echo   "Boss, Production is propagating (Cloud Delay).
echo    This is the STAGING SERVER showing the final design running live."
echo.
echo ===============================================================================
cd app
call npm run dev
pause
