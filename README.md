# PickPick

> 상황을 이해하고 구매 결정을 도와주는 AI 쇼핑 에이전트

사용자가 자연어로 쇼핑 상황을 입력하면 목적, 예산, 대상, 취향과 제약조건을 분석하고 내부 상품 데이터에서 적합한 상품 3개를 추천합니다. 추천 이유와 비교 기준, 구매 전 확인 사항까지 제공하는 웹서비스 형태의 프로토타입입니다.

## 제출 정보

- 배포 URL: https://pickpick-five.vercel.app
- GitHub Repository URL: https://github.com/sejin573/pickpick
- 테스트 계정: 로그인 기능 없음 / 접속 후 바로 사용 가능

## 문제 정의

사용자는 상품을 고를 때 너무 많은 정보 때문에 오히려 결정을 내리기 어렵습니다. 가격, 구매 목적, 받을 사람, 취향, 실용성과 감성 요소를 동시에 비교하려면 시간과 노력이 많이 듭니다.

PickPick은 정형화된 검색 필터 대신 자연어 입력 한 문장만으로 조건을 구조화하고, 선택의 근거와 구매 전 체크포인트까지 제안해 이 문제를 해결합니다.

## 주요 기능

- 자연어 기반 쇼핑 상황 입력
- 예산, 대상, 목적, 취향, 제약조건 자동 추론
- 28개 샘플 상품의 태그·상황·대상 매칭
- 예산, 목적 적합도, 실용성, 감성, 가성비, 리스크 기반 점수 계산
- 추천 상품 3개와 추천 근거 제공
- 상품 간 비교 테이블 제공
- 바로 구매할 조건과 추가 확인 사항을 포함한 구매 판단 가이드
- OpenAI API 키가 없어도 동일한 응답 구조로 동작하는 fallback agent
- 네이버 쇼핑 API 연동 시 실제 판매 상품의 이미지·가격·판매처·링크 제공
- OpenAI 또는 Ollama를 선택할 수 있는 LLM 공급자 구조
- 모바일·데스크톱 반응형 UI와 로딩·오류 상태

## 기술 스택

- Next.js 15, App Router
- React 19
- TypeScript
- Tailwind CSS
- Next.js Route Handler
- OpenAI Responses API 연동 가능 구조
- TypeScript 배열 기반 로컬 상품 데이터
- Vercel 배포 구조

## 프로젝트 구조

```text
app/
  api/recommend/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  AgentSteps.tsx
  AnalysisPanel.tsx
  BuyingGuide.tsx
  ComparisonTable.tsx
  Hero.tsx
  PromptExamples.tsx
  RecommendationCards.tsx
  ServiceInfo.tsx
lib/
  agent.ts
  products.ts
  types.ts
```

## 로컬 실행

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 빌드 확인

```bash
npm run build
npm run start
```

## 환경 변수

`.env.example`을 복사해 `.env.local`을 만들고 사용할 공급자의 키를 입력합니다.

```bash
OPENAI_API_KEY=your_openai_api_key_here
LLM_PROVIDER=openai

NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

OLLAMA_BASE_URL=
OLLAMA_MODEL=qwen3:4b
OLLAMA_API_KEY=
```

`OPENAI_API_KEY`는 `app/api/recommend/route.ts`를 통해 호출되는 서버 코드에서만 사용되며 클라이언트 번들에 포함되지 않습니다. 키가 없거나 OpenAI API 호출이 실패해도 fallback agent가 정상적인 추천 결과를 반환합니다.

### 실제 상품 데이터

네이버 개발자 센터에서 애플리케이션을 등록하고 검색 API의 Client ID와 Client Secret을 발급받아 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`에 설정합니다. 값이 있으면 네이버 쇼핑 검색 결과를 우선 사용하고, 없거나 호출에 실패하면 내장 상품 데이터로 자동 복귀합니다.

쿠팡 구매 링크 자동화는 쿠팡 파트너스 승인과 별도 API 자격증명이 필요한 영역이므로 현재 공급자 확장 대상으로 분리했습니다. 승인 전에는 무단 크롤링 대신 공식 API 또는 일반 검색 링크만 사용합니다.

### Ollama

로컬 개발에서 Ollama를 사용할 경우:

```bash
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
```

Ollama를 실행한 PC의 `localhost`는 Vercel에서 접근할 수 없습니다. 배포 환경에서는 Ollama Cloud API 주소와 키를 설정하거나 OpenAI 공급자를 사용해야 합니다.

## LLM / Agent 동작 구조

1. 사용자 입력 분석
2. 예산, 대상, 상황, 선호와 제약조건 추출
3. 상품의 `tags`, `targetUsers`, `situations` 기반 후보 매칭
4. 예산 적합도, 실용성, 감성, 가성비와 리스크를 조합해 0~100점 계산
5. 상위 3개 상품 선정
6. 추천 이유와 구매 판단 가이드 생성
7. 설정에 따라 OpenAI Responses API 또는 Ollama Chat API로 설명 문구만 자연스럽게 보완

상품 필터링과 순위 계산은 항상 코드 기반으로 먼저 수행합니다. LLM은 상품이나 점수를 임의로 바꾸지 않고 사용자에게 보여줄 설명 문구를 다듬는 역할만 맡습니다. 화면의 Agent Flow는 실제 chain-of-thought가 아니라 사용자에게 공개 가능한 판단 단계 요약입니다.

## 데이터 흐름

```text
사용자 자연어 입력
  → POST /api/recommend
  → 조건 추출
  → 로컬 상품 데이터 매칭
  → 추천 점수 계산
  → 상위 3개 선정
  → OpenAI 문구 보완(선택)
  → fallback 포함 동일한 JSON 응답
  → 분석·추천·비교·구매 가이드 UI
```

API 입력:

```json
{
  "message": "20대 후반 여자친구 생일선물 30만원대 추천해줘"
}
```

API 응답은 `analysis`, `agentSteps`, `recommendations`, `comparison`, `buyingGuide`를 포함합니다.

## 상품 데이터

현재는 과제용 샘플 데이터셋을 사용합니다.

- 기본값은 총 28개 샘플 상품
- 네이버 쇼핑 API 설정 시 현재 판매 상품으로 동적 교체
- 카테고리: 선물, 전자기기, 생활/자취, 뷰티/패션, 여행, 건강, 개발/업무
- 필드: id, name, category, price, tags, targetUsers, situations, strengths, cautions, emotionalScore, practicalScore, valueScore, riskScore, description

향후 실제 커머스 API, 네이버 쇼핑 API, 쿠팡 파트너스, 자사몰 상품 DB와 리뷰 데이터로 확장할 수 있습니다.

## 중점적으로 구현한 부분

- API 키 없이도 동작하는 fallback agent
- 자연어 예산 표현과 핵심 쇼핑 키워드 추출
- 설명 가능한 추천 점수 계산 로직
- 에이전트 판단 흐름 시각화
- 실제 서비스처럼 이어지는 분석 → 추천 → 비교 → 구매 가이드 UI
- 서버 전용 API 호출과 클라이언트 화면의 분리
- Vercel에 바로 배포 가능한 Next.js 구조

## 구현하지 못한 부분

- 쿠팡 파트너스 API 연동
- 실시간 가격 비교
- 실제 리뷰 수집 및 요약
- 로그인과 사용자별 개인화 저장
- 판매처 이동 및 제휴 링크

## 향후 개선 방향

- 네이버 쇼핑 API 연동
- 실제 리뷰 요약과 신뢰도 분석
- 쿠팡·자사몰 링크 및 재고 관리
- 사용자별 추천 히스토리 저장
- 임베딩 기반 의미 검색
- A/B 테스트 기반 추천 점수 개선

## AI 개발 도구 활용 여부

Codex를 활용해 초기 프로젝트 구조, 컴포넌트 작성, 추천 로직 초안과 README 초안을 생성했습니다. 생성된 코드는 요구사항과 데이터 흐름에 맞는지 직접 검토하고 수정했습니다.

## GitHub 업로드

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <GitHub Repository URL>
git push -u origin main
```

## Vercel 배포

1. Vercel에 로그인합니다.
2. **Add New Project**를 선택합니다.
3. GitHub Repository를 Import합니다.
4. Framework Preset이 **Next.js**인지 확인합니다.
5. 필요한 경우 Environment Variables에 `OPENAI_API_KEY`를 추가합니다.
   - API 키가 없어도 fallback agent로 동작합니다.
6. **Deploy**를 클릭합니다.
7. 배포 완료 후 생성된 URL을 이 README의 배포 URL 항목에 작성합니다.

## 제출 전 체크리스트

- [x] Node.js 20 이상 설치
- [x] `npm install`
- [x] `npm run dev`
- [x] `npm run build`
- [x] GitHub Repository 생성
- [x] GitHub에 push
- [x] Vercel 프로젝트 생성 및 배포
- [ ] 필요 시 `OPENAI_API_KEY` 환경변수 설정
- [x] Deploy
- [x] README에 배포 URL 작성
- [x] README에 GitHub Repository URL 작성
- [ ] 과제 제출 페이지에 배포 URL과 GitHub URL 제출
