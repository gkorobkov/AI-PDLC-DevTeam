@echo off
REM Change to UI directory, install dependencies, build the frontend, and run UI tests
pushd ui
if exist package-lock.json (
  call npm ci
) else (
  call npm install
)
call npm run build
call npm test -- --watchAll=false
popd
