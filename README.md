# Vibe Chat 🤖✨

**Vibe Chat**은 Next.js와 Ollama를 활용한 로컬 LLM 기반의 감성적인 AI 채팅 애플리케이션입니다.
현대적인 UI, 다크 모드, 그리고 부드러운 애니메이션을 제공하며, 시스템 프롬프트를 동적으로 변경하여 다양한 페르소나와 대화할 수 있습니다.

![Vibe Chat Screenshot](https://github.com/GomGomi907/ollamachatbot/assets/placeholder.png)

---

## ✨ 주요 기능 (Features)

- **💬 실시간 스트리밍 대화**: Ollama와 연동하여 끊김 없는 대화 경험 제공
- **⚙️ 동적 시스템 프롬프트**: 설정 모달에서 AI의 성격과 역할을 실시간으로 변경
- **🧩 스킬 프리셋 (Skill Presets)**:
  - 🤖 **Default**: 기본 코딩 어시스턴트
  - ⚡ **AI Chatbot Builder**: 챗봇 설계 전문가
  - 🎨 **Landing Page Expert**: 랜딩페이지 전환율 전문가
  - 🏴‍☠️ **Pirate Mode**: 해적 선장 모드
- **📱 모바일 최적화**: 반응형 디자인 및 터치 인터페이스 완벽 지원
- **🎨 모던 UI/UX**: Glassmorphism, Framer Motion 애니메이션, Syntax Highlighting

---

## 🛠️ 설치 및 실행 방법 (Getting Started)

### 1. 필수 요구사항 (Prerequisites)
- **Node.js** 18.17 이상
- **Ollama** (로컬 LLM 실행용)

### 2. 백엔드 세팅 (Ollama Setup)
이 프로젝트는 로컬에서 실행되는 **Ollama**를 백엔드로 사용합니다.

1.  **Ollama 설치**: [ollama.com](https://ollama.com)에서 다운로드 및 설치
2.  **모델 다운로드**: 터미널에서 다음 명령어 실행
    ```bash
    ollama pull gpt-oss:20b
    # 또는 가벼운 모델을 원한다면:
    # ollama pull llama3
    ```
    *(참고: 프로젝트 코드 내 모델명은 `gpt-oss:20b`로 설정되어 있습니다. 다른 모델을 사용하려면 `components/chat-interface.tsx`의 헤더 표시 부분을 수정하세요.)*

3.  **CORS 설정 및 서버 실행**:
    웹 브라우저에서 Ollama API에 접속할 수 있도록 환경 변수를 설정해야 합니다.

    **Windows (PowerShell):**
    ```powershell
    $env:OLLAMA_ORIGINS="*"; ollama serve
    ```

    **Mac/Linux:**
    ```bash
    OLLAMA_ORIGINS="*" ollama serve
    ```

### 3. 프로젝트 설치 및 실행
1.  **리포지토리 클론**:
    ```bash
    git clone https://github.com/GomGomi907/ollamachatbot.git
    cd ollamachatbot
    ```

2.  **패키지 설치**:
    ```bash
    npm install
    ```

3.  **개발 서버 실행**:
    ```bash
    npm run dev
    ```

4.  **접속**: 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 🌐 외부 접속 (External Access)

스마트폰이나 다른 컴퓨터에서 내 로컬 챗봇에 접속하려면 `ngrok` 또는 `localtunnel`을 사용하세요.

자세한 방법은 [docs/external_access.md](./docs/external_access.md) 문서를 참고하세요.

**간단 요약 (localtunnel 사용 시):**
```bash
npx localtunnel --port 3000
```

---

## 📂 프로젝트 구조

```
.
├── app/                    # Next.js App Router
│   ├── api/chat/route.ts   # Chat API Endpoint (Ollama 연동)
│   └── page.tsx            # 메인 페이지
├── components/
│   └── chat-interface.tsx  # 핵심 채팅 UI 컴포넌트
├── docs/                   # 추가 문서
│   └── external_access.md  # 외부 접속 가이드
├── public/                 # 정적 파일
└── ...
```

## 🤝 기여 (Contributing)
이 프로젝트는 오픈 소스입니다. 버그 리포트나 기능 제안은 언제나 환영합니다!
