@echo off
chcp 65001 >nul
title Control de Gastos
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Para usar el servidor necesitas instalar Node.js ^(gratis^).
  echo   Se abrira la pagina de descarga: instala la version LTS y vuelve a abrir este archivo.
  echo.
  echo   Mientras tanto puedes abrir index.html directamente en el navegador.
  start "" https://nodejs.org
  pause
  exit /b 1
)
node server.js
pause
