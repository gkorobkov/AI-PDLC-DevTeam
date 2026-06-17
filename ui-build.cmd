@echo off
setlocal

set QUIET=0
if /i "%1"=="--quiet" set QUIET=1
if /i "%1"=="-q"      set QUIET=1
set CLEAN_INSTALL=0
if /i "%1"=="--clean" set CLEAN_INSTALL=1
if /i "%2"=="--clean" set CLEAN_INSTALL=1

set ROOT=%~dp0
set BUILD_DIR=%ROOT%.build\ui
set UI_DIR=%ROOT%ui
set UI_VERSION_SRC=%UI_DIR%\src\App.jsx

if "%QUIET%"=="0" echo Build root: %ROOT%

if not exist "%UI_DIR%\package.json" (
    echo ERROR: UI package.json not found: %UI_DIR%\package.json
    exit /b 1
)

if not exist "%UI_VERSION_SRC%" (
    echo ERROR: UI version source not found: %UI_VERSION_SRC%
    exit /b 1
)

for /f "delims=" %%v in ('powershell -NoProfile -Command "$f='%UI_VERSION_SRC%'; $c=[IO.File]::ReadAllText($f); if ($c -match 'APP_VERSION = ''([\d]+\.[\d]+\.)([\d]+)''') { $old=$Matches[0]; $ver=$Matches[1]+([int]$Matches[2]+1); $new='APP_VERSION = ''' + $ver + ''''; [IO.File]::WriteAllText($f,$c.Replace($old,$new)); $ver } else { exit 1 }"') do set APP_VER=%%v
if errorlevel 1 (
    echo ERROR: Failed to increment APP_VERSION
    exit /b 1
)

if "%QUIET%"=="0" echo [OK] APP_VERSION incremented to: %APP_VER%

pushd "%UI_DIR%"

if "%CLEAN_INSTALL%"=="1" if exist package-lock.json (
    if "%QUIET%"=="0" echo Installing UI dependencies with npm ci...
    call npm ci
    if errorlevel 1 (
        popd
        echo ERROR: Failed to install UI dependencies
        exit /b 1
    )
    goto dependencies_ready
)

if not exist node_modules (
    if "%QUIET%"=="0" echo Installing UI dependencies with npm install...
    call npm install
    if errorlevel 1 (
        popd
        echo ERROR: Failed to install UI dependencies
        exit /b 1
    )
) else (
    if "%QUIET%"=="0" echo [OK] UI dependencies already installed
)

:dependencies_ready

if "%QUIET%"=="0" echo Building UI into %BUILD_DIR%...
call npm run build
if errorlevel 1 (
    popd
    echo ERROR: Failed to build UI
    exit /b 1
)

popd

if "%QUIET%"=="0" echo [OK] UI build output: .\.build\ui\
