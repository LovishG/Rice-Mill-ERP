@echo off
title Rice Mill ERP - Server Launcher
echo ===============================================================
echo                RICE MILL ERP (Commercial & CMR)
echo ===============================================================
echo Starting local ERP engine...
cd /d "%~dp0backend"
start "" http://localhost:3000
node dist/server.js
pause
