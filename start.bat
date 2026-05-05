@echo off
title ZARii AI Server
echo.
echo  ==========================================
echo   ZARii AI -- Starting server on port 5000
echo  ==========================================
echo.

:loop
echo [%time%] Starting server...
node backend/server.js
echo.
echo [%time%] Server stopped. Restarting in 3 seconds...
timeout /t 3 /nobreak > nul
goto loop
