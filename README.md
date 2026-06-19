# 생활계산소 (Living Calculator)

일상 계산기 모음. 예산·퇴사 정산·가구 배치·쓰레기 분리수거 등 생활에 필요한 도구를 한 곳에서 제공하는 클라이언트 전용 SPA입니다.

GitHub Pages에 배포되며 (`/check-income-calc/`), 백엔드 없이 모든 상태를 `localStorage`/메모리에 저장합니다.

## 기술 스택

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router 7 (HashRouter) · Vitest · React Three Fiber

## 시작하기

```bash
npm install
npm run dev      # http://localhost:5173/check-income-calc/ (base 경로 필수)
```

> `vite.config.ts`의 `base`가 `/check-income-calc/`이므로 `localhost:5173/`로 바로 접속하면 404가 납니다.

## 명령어

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (HMR) |
| `npm run build` | 타입 체크(`tsc -b`) 후 프로덕션 빌드 → `dist/` |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run test` | Vitest 단위 테스트 |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 타입만 검사 (작업 완료 전 권장) |

## 도구 목록

| 도구 | 카테고리 | 상태 |
|------|----------|------|
| 예산 계산기 | 돈 관리 | ✅ |
| 구독 계산기 | 돈 관리 | ✅ |
| 퇴사 정산 계산기 | 돈 관리 | ✅ |
| 배달 vs 요리 계산기 | 먹거리 | ✅ |
| 냉장고 재료 요리 추천 | 먹거리 | ✅ |
| 방 가구 시뮬레이터 | 집 / 공간 | ✅ |
| 얼룩 제거 가이드 | 생활 관리 | ✅ |
| 이거 어디 버려? (분리수거) | 생활 관리 | ✅ |
| 날짜 계산기 | 생활 관리 | ✅ |
| 저축 목표 · 은퇴 계획 · 근무 일정 | 돈 관리 | 🚧 예정 |

도구 메타데이터의 단일 소스는 [src/data/tools.ts](src/data/tools.ts)입니다.

## 아키텍처

비자명한 로직을 가진 도구는 **2계층 패턴**을 사용합니다.

- **Feature 계층** (`src/features/`) — 순수 TypeScript 로직, React 의존성 없음, 테스트 가능 (예: `room-layout/`)
- **Tool 계층** (`src/tools/`) — React UI, Feature 계층을 사용

상태 관리는 React Context(`BudgetContext`, `ThemeContext`)만 사용하며 별도 상태 라이브러리는 없습니다. 모든 스타일은 `src/index.css`의 CSS 디자인 토큰을 따릅니다.

### 새 도구 추가 시 4곳을 수정

1. `src/App.tsx` — 라우트
2. `src/pages/tools/` — 페이지 컴포넌트
3. `src/data/tools.ts` — 도구 메타데이터
4. `src/tools/<tool-name>/` — 구현

## 배포

`main` 브랜치 push 시 GitHub Actions(`.github/workflows/deploy.yml`)가 자동으로 빌드·배포합니다 (Node 20). SPA 폴백이 없는 GitHub Pages 특성상 **HashRouter**를 사용하므로 `BrowserRouter`로 전환하지 마세요.

## 문서

자세한 내용은 AI 어시스턴트 가이드인 [CLAUDE.md](CLAUDE.md)와 `docs/` 디렉터리를 참고하세요.

| 문서 | 내용 |
|------|------|
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | 폴더 구조, 라우팅, 아키텍처 |
| [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | 설치·실행·빌드·테스트 |
| [docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md) | 디자인 토큰, UI 패턴 |
| [docs/AI_SESSION_NOTES.md](docs/AI_SESSION_NOTES.md) | 최근 변경 및 결정 사항 |
