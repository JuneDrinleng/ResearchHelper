@echo off
setlocal

:: Define variables
set PYTHON_SCRIPT=main.py
set PYTHON_DIST=dist
set PYTHON_BUILD=build
set PYTHON_EXE=main.exe
set ELECTRON_APP_NAME=MyApp
set ELECTRON_OUTPUT_DIR=%ELECTRON_APP_NAME%-win32-x64

:: Clean previous builds
if exist %PYTHON_BUILD% rmdir /s /q %PYTHON_BUILD%
if exist %PYTHON_DIST% rmdir /s /q %PYTHON_DIST%
if exist %ELECTRON_OUTPUT_DIR% rmdir /s /q %ELECTRON_OUTPUT_DIR%

:: Package Python script
call .venv\Scripts\activate
pyinstaller --onefile --noconsole %PYTHON_SCRIPT%

:: Verify Python executable exists
if not exist %PYTHON_DIST%\%PYTHON_EXE% (
    echo Python executable not found. Build failed.
    exit /b 1
)

:: Install Electron Builder if not installed
where electron-builder >nul 2>nul
if errorlevel 1 (
    npm install -g electron-builder
)

:: Package Electron app
electron-builder --win --x64 --config electron-builder.json
