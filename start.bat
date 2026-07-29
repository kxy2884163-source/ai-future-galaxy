@echo off
REM AI 未来星域社区 · Windows 一键启动脚本
REM 端口：8000

cd /d "%~dp0"

echo.
echo  ===========================================
echo   AI 未来星域社区 · 本地 dev server
echo  ===========================================
echo.

REM 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js 未安装
  echo 请访问 https://nodejs.org/ 下载安装
  pause
  exit /b 1
)

REM 检查端口 8000 是否被占用
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
  echo [WARN] 端口 8000 已被占用
  echo 请检查是否已有 server.js 在跑，或者修改 server.js 的 PORT
  echo.
)

REM 启动 server
echo [INFO] 启动 server.js ...
echo [INFO] 访问 http://localhost:8000
echo [INFO] Ctrl+C 停止
echo.

node server.js

pause