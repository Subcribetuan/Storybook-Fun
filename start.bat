@echo off
title Storybook Fun - Dev Server
echo Starting dev server on http://localhost:5991 ...
echo.
start "" http://localhost:5991
cd /d "%~dp0"
npx cross-env NODE_ENV=development npx tsx server/index.ts
pause
