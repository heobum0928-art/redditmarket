@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 레딧에서 품앗이 상대를 찾는 중... (1분 정도 걸려요)
node find-swaps.mjs
start "" "%~dp0swap.html"
