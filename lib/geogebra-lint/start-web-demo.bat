@echo off
REM GeoGebra Lint Web Demo 启动脚本

echo ================================
echo GeoGebra Lint - Web Demo Launcher
echo ================================
echo.

REM 检查是否需要构建
if not exist "dist\index.js" (
    echo [1/2] 构建项目...
    node scripts\convert-json.js
    call npm run build:browser
    if %ERRORLEVEL% NEQ 0 (
        echo 构建失败！
        pause
        exit /b 1
    )
) else (
    echo [1/2] 项目已构建 ✓
)

echo.
echo [2/2] 启动 HTTP 服务器...
echo.
echo 浏览器将自动打开 http://localhost:8080/tests/web-demo.html
echo 按 Ctrl+C 停止服务器
echo.

REM 在后台启动服务器并打开浏览器
start http://localhost:8080/tests/web-demo.html
python -m http.server 8080
