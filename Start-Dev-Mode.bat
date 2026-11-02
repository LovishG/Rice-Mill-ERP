@echo off
title Rice Mill ERP - Development Server (Live Reload)
echo ===============================================================
echo        RICE MILL ERP - DEVELOPER MODE (HMR LIVE RELOAD)
echo ===============================================================
echo Starting Backend (port 3000) and Angular Dev Server (port 4200)...
cd /d "%~dp0"
start "" http://localhost:4200
npm run dev
pause
