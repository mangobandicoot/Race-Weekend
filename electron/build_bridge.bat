@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM build_bridge.bat
REM Compiles bridge.py into a standalone bridge.exe using PyInstaller.
REM Run this BEFORE running `npm run build:win`.
REM
REM Requirements:
REM   pip install pyinstaller irsdk flask flask-cors
REM ─────────────────────────────────────────────────────────────────────────────

echo [Bridge] Installing Python dependencies...
pip install pyinstaller irsdk flask flask-cors --quiet

echo [Bridge] Compiling bridge.py...
pyinstaller ^
  --onefile ^
  --noconsole ^
  --name bridge ^
  --distpath bridge ^
  --workpath build/pyinstaller ^
  --specpath build/pyinstaller ^
  bridge.py

IF %ERRORLEVEL% NEQ 0 (
  echo [Bridge] ERROR: PyInstaller failed. Check output above.
  exit /b 1
)

echo [Bridge] Done. Output: bridge\bridge.exe
echo [Bridge] Now run: npm run build:win
