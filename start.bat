@echo off
chcp 65001 >nul
echo 🚀 Vibe Chat 시작 중...
echo.

echo 🤖 Ollama 서버 시작 (CORS 활성화)...
start "Ollama Server" cmd /k "set OLLAMA_ORIGINS=* && ollama serve"

echo ⏳ Ollama 시작 대기 중 (5초)...
timeout /t 5 /nobreak >nul

echo.
echo 📦 Next.js 개발 서버 시작...
start "Next.js Dev Server" cmd /k "npm run dev"

echo ⏳ 서버 시작 대기 중 (10초)...
timeout /t 10 /nobreak >nul

echo.
echo 🌐 ngrok 터널 시작...
start "ngrok Tunnel" cmd /k "ngrok.exe http 3000"

echo.
echo ✅ 모든 서비스가 시작되었습니다!
echo 📝 실행 중인 서비스:
echo    - Ollama Server (로컬 LLM)
echo    - Next.js Dev Server (포트 3000)
echo    - ngrok Tunnel (외부 접속)
echo.
echo 📱 ngrok 창에서 https://... URL을 확인하세요.
echo 🛑 종료하려면 각 창을 닫으세요.
echo.
pause
