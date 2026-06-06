@echo off
REM Change to UI directory, install dependencies and build the frontend
pushd ui
if exist package-lock.json (
  npm ci
) else (
  npm install
)
npm run build
popd
pause
