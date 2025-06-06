@echo off
call .venv\Scripts\activate

pyinstaller --noconfirm --windowed ^
  --name ResearchHelper ^
  --icon=favicon.ico ^
  --add-data "templates;templates" ^
  --add-data "favicon.ico;." ^
  run_with_tray.py

pause
