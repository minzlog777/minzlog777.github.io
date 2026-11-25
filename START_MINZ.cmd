@echo off
setlocal
cd /d "%~dp0"
py -3 -c "import sys; assert sys.version_info >= (3, 8)" >nul 2>&1
if not errorlevel 1 (
  py -3 "%~dp0minz_preview.py"
  pause
  exit /b
)
python -c "import sys; assert sys.version_info >= (3, 8)" >nul 2>&1
if not errorlevel 1 (
  python "%~dp0minz_preview.py"
  pause
  exit /b
)
echo Python 3.8+ was not found. Use VS Code Live Server instead.
where code >nul 2>&1
if not errorlevel 1 call code "%~dp0."
echo Right-click minz-directors-v7-focus.html and select Open with Live Server.
pause
