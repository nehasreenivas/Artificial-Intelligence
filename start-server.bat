@echo off
cd /d "%~dp0"
echo Starting local server...
http-server -p 8000
pause