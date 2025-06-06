@echo off
call .venv\Scripts\activate

pyinstaller --noconfirm --windowed --onefile ^
  --name ResearchHelper ^
  --icon=static/favicon.ico ^
  --add-data "templates;templates" ^
  --add-data "static;static" ^
  main.py

pause
