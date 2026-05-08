@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ==========================
echo   PARAKEET AI STABLE
echo ==========================
echo.

cd /d "%~dp0"

:: ============================================================
:: FORCE MODE (RESET TOTAL)
:: ============================================================
if "%1"=="--force" (
    echo.
    echo [FORCE] Cerrando sistema completo...

    taskkill /F /IM python.exe >nul 2>&1
    taskkill /F /IM pythonw.exe >nul 2>&1
    taskkill /F /IM node.exe >nul 2>&1
    taskkill /F /IM electron.exe >nul 2>&1

    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":9000" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )

    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8765" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )

    wmic process where "commandline like '%%whisper%%'" delete >nul 2>&1
    wmic process where "commandline like '%%bridge%%'" delete >nul 2>&1

    timeout /t 2 >nul
    echo [OK] Limpieza completa
)

:: ============================================================
:: CHECK BACKEND
:: ============================================================
echo.
echo [CHECK] Estado backend...

set WHISPER_OK=0
set BRIDGE_OK=0

curl -s http://localhost:9000/health >nul 2>&1
if %errorlevel%==0 set WHISPER_OK=1

netstat -ano | findstr ":8765" >nul 2>&1
if %errorlevel%==0 set BRIDGE_OK=1

:: ============================================================
:: START BACKEND (SOLO SI NO EXISTE)
:: ============================================================
echo.
echo [BACKEND] Iniciando...

if "%WHISPER_OK%"=="0" (
    if exist "\parakeet\bridge\whisper_server.py" (
        echo Iniciando Whisper...
        start "Whisper" /min cmd /k python bridge\whisper_server.py --model base --port 9000
    ) else (
        echo WARN: Whisper no encontrado
    )
) else (
    echo Whisper ya activo
)

if "%BRIDGE_OK%"=="0" (
    if exist "parakeet\bridge\bridge.py" (
        echo Iniciando Bridge...
        start "Bridge" /min cmd /k python bridge\bridge.py
    ) else (
        echo WARN: Bridge no encontrado
    )
) else (
    echo Bridge ya activo
)

timeout /t 2 >nul

:: ============================================================
:: ELECTRON
:: ============================================================
echo.
echo [APP] Lanzando Electron...

cd /d "%~dp0"

if exist "electron" (
    cd electron
) else if exist "parakeet\electron" (
    cd parakeet\electron
) else (
    echo ERROR: No se encontro Electron
    pause
    exit /b
)

if exist node_modules\.bin\electron.cmd (
    start "" node_modules\.bin\electron.cmd .
) else (
    npx electron .
)

echo.
echo ==========================
echo  PARAKEET LISTO
echo ==========================
pause