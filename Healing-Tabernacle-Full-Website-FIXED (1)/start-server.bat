@echo off
cd /d "%~dp0"
echo Starting local server for Healing Tabernacle website...
echo.

where python >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:8000/index.html
    python -m http.server 8000
    goto :eof
)

where python3 >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:8000/index.html
    python3 -m http.server 8000
    goto :eof
)

where npx >nul 2>nul
if %errorlevel%==0 (
    echo Python not found, using npx serve instead...
    npx serve -l 8000
    goto :eof
)

echo Could not find Python or Node/npx on this computer.
echo Please install Python (https://python.org) or Node.js (https://nodejs.org) and try again.
pause
