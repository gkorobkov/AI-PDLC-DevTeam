@echo off
setlocal enabledelayedexpansion

set ROOT=%~dp0
set ENV_FILE=!ROOT!.env
set BUILD_DIR=!ROOT!.build\ui

if not exist "!ENV_FILE!" (
    echo ERROR: .env file not found: !ENV_FILE!
    exit /b 1
)

if not exist "!BUILD_DIR!\index.html" (
    echo ERROR: UI build not found: !BUILD_DIR!\index.html
    echo Run ui-build.cmd first.
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in ("!ENV_FILE!") do (
    set %%A=%%B
)

if "!DEPLOY_USER!"=="" ( echo ERROR: DEPLOY_USER not set in .env & exit /b 1 )
if "!DEPLOY_HOST!"=="" ( echo ERROR: DEPLOY_HOST not set in .env & exit /b 1 )
if "!DEPLOY_PATH!"=="" ( echo ERROR: DEPLOY_PATH not set in .env & exit /b 1 )

echo Deploying to !DEPLOY_USER!@!DEPLOY_HOST!:!DEPLOY_PATH!
echo Source: !BUILD_DIR!\

ssh-copy-remote --user=!DEPLOY_USER! --server=!DEPLOY_HOST! --local_path="!BUILD_DIR!\" --remote_path="!DEPLOY_PATH!" --copy
if errorlevel 1 exit /b 1
