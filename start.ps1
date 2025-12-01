# Vibe Chat 실행 스크립트
Write-Host "🚀 Vibe Chat 시작 중..." -ForegroundColor Cyan

# Ollama 서버 시작 (CORS 활성화)
Write-Host "`n🤖 Ollama 서버 시작 (CORS 활성화)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:OLLAMA_ORIGINS='*'; ollama serve" -WindowStyle Normal

# Ollama가 시작될 때까지 대기
Write-Host "⏳ Ollama 시작 대기 중 (5초)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Next.js 개발 서버 시작
Write-Host "`n📦 Next.js 개발 서버 시작..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal

# 서버가 시작될 때까지 대기
Write-Host "⏳ 서버 시작 대기 중 (10초)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# ngrok 시작
Write-Host "`n🌐 ngrok 터널 시작..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\ngrok.exe http 3000" -WindowStyle Normal

Write-Host "`n✅ 모든 서비스가 시작되었습니다!" -ForegroundColor Green
Write-Host "📝 실행 중인 서비스:" -ForegroundColor Cyan
Write-Host "   - Ollama Server (로컬 LLM)" -ForegroundColor White
Write-Host "   - Next.js Dev Server (포트 3000)" -ForegroundColor White
Write-Host "   - ngrok Tunnel (외부 접속)" -ForegroundColor White
Write-Host "`n📱 ngrok 창에서 https://... URL을 확인하세요." -ForegroundColor Cyan
Write-Host "🛑 종료하려면 각 창을 닫으세요.`n" -ForegroundColor Yellow
