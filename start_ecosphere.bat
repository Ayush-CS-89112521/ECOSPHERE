@echo off
title EcoSphere - Unified Environmental Intelligence Platform
cd /d "%~dp0"
echo ========================================================
echo        EcoSphere - Live Atmospheric Intelligence
echo ========================================================
echo.
echo Starting Unified Next.js Web App on http://localhost:3000 ...
start "" "http://localhost:3000/dashboard"
cd /d "%~dp0frontend" && npm run dev
