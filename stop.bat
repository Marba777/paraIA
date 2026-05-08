@echo off
chcp 65001 >nul 2>&1
title Parakeet - Deteniendo...

echo.
echo  Deteniendo Parakeet AI...
echo.

:: Matar ventanas de consola de Parakeet
taskkill /F /FI "WINDOWTITLE eq Parakeet-Whisper" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Parakeet-Bridge"  >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Parakeet-Electron" >nul 2>&1

:: Matar por puertos
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":9000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8765 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Matar procesos Python de Parakeet
wmic process where "name='python.exe' and commandline like '%%bridge%%'"   delete >nul 2>&1
wmic process where "name='python.exe' and commandline like '%%whisper%%'"  delete >nul 2>&1
wmic process where "name='python3.exe' and commandline like '%%bridge%%'"  delete >nul 2>&1
wmic process where "name='python3.exe' and commandline like '%%whisper%%'" delete >nul 2>&1

echo  [OK] Todos los procesos de Parakeet detenidos.
echo.
timeout /t 2 /nobreak >nul
