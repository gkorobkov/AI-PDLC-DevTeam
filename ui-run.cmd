@echo off
setlocal

set ROOT=%~dp0
set BUILD_DIR=%ROOT%.build\ui

if "%~1"=="" goto run_dev
if /i "%~1"=="--build-preview" goto run_build_preview
if /i "%~1"=="--preview" goto run_build_preview
if /i "%~1"=="--build" (
    echo ERROR: --build was renamed to --build-preview.
    echo Use: ui-run.cmd --build-preview
    exit /b 1
)

echo ERROR: Unknown parameter: %~1
echo Usage:
echo   ui-run.cmd
echo   ui-run.cmd --preview
echo   ui-run.cmd --build-preview
exit /b 1

:run_dev
start "AI-PDLC UI Dev :3000" cmd /k "npm run start --prefix ""%ROOT%ui"" -- --port 3000"
exit /b 0

:run_build_preview
if not exist "%BUILD_DIR%\index.html" (
    echo ERROR: UI build not found: %BUILD_DIR%\index.html
    echo Run ui-build.cmd first.
    exit /b 1
)

start "AI-PDLC UI Build Preview :3001" cmd /k "npm run preview --prefix ""%ROOT%ui"" -- --port 3001 --outDir ""../.build/ui"""
