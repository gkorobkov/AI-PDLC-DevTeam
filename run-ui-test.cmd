@echo off
REM Change to UI directory, install dependencies, build the frontend, and run UI tests
pushd ui
if exist package-lock.json (
  npm ci
) else (
  npm install
)
npm run build
npm test -- --watchAll=false
popd
pause
