@echo off
setlocal

set ROOT=%~dp0
set BUILD_DIR=%ROOT%.build\ui

if /i "%1"=="--build" goto run_build
if /i "%1"=="--preview" goto run_build

start "AI-PDLC UI Dev" cmd /k "npm run start --prefix ""%ROOT%ui"""
exit /b 0

:run_build
if not exist "%BUILD_DIR%\index.html" (
    echo ERROR: UI build not found: %BUILD_DIR%\index.html
    echo Run ui-build.cmd first.
    exit /b 1
)

start "AI-PDLC UI Build" cmd /k "npm run preview --prefix ""%ROOT%ui"" -- --outDir ""../.build/ui"""
