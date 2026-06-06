rem @echo off
rem cd /d "%~dp0"

netstat -ano | findstr /R /C:":8000 .*LISTENING" >nul
if not errorlevel 1 (
  echo Port 8000 is already in use. Stop the existing backend or Docker container before starting backend.
  netstat -ano | findstr /R /C:":8000 .*LISTENING"
  exit /b 1
)
start "AI-PDLC Backend" cmd /k "call venv-activate && python -m app.main"



