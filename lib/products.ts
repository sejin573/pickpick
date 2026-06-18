import { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "gift-01", name: "프리미엄 티 & 머그 세트", category: "선물", price: 59000,
    tags: ["선물", "생일", "감성", "차", "집들이"], targetUsers: ["친구", "직장인", "부모님"],
    situations: ["생일", "집들이", "감사"], strengths: ["취향을 덜 타는 구성", "선물 포장 만족도"], cautions: ["카페인 민감 여부 확인"],
    emotionalScore: 82, practicalScore: 72, valueScore: 84, riskScore: 18, description: "일상에 작은 휴식을 더하는 티와 머그 선물 세트"
  },
  {
    id: "gift-02", name: "맞춤 각인 가죽 카드지갑", category: "선물", price: 89000,
    tags: ["선물", "기념일", "생일", "각인", "패션"], targetUsers: ["여자친구", "남자친구", "직장인"],
    situations: ["생일", "기념일", "취업"], strengths: ["개인화 가능", "오래 사용하는 선물"], cautions: ["각인 후 교환이 어려움"],
    emotionalScore: 91, practicalScore: 83, valueScore: 78, riskScore: 30, description: "이름이나 짧은 문구를 새길 수 있는 슬림 카드지갑"
  },
  {
    id: "gift-03", name: "무선 포토 프린터", category: "선물", price: 159000,
    tags: ["선물", "여행", "사진", "감성", "여자친구"], targetUsers: ["여자친구", "친구", "여행자"],
    situations: ["생일", "기념일", "여행"], strengths: ["추억을 바로 출력", "활용 장면이 명확함"], cautions: ["전용 인화지 추가 비용"],
    emotionalScore: 95, practicalScore: 70, valueScore: 73, riskScore: 25, description: "스마트폰 사진을 즉석에서 인화하는 휴대용 프린터"
  },
  {
    id: "gift-04", name: "호텔 스파 이용권", category: "선물", price: 280000,
    tags: ["선물", "휴식", "기념일", "부모님", "여자친구"], targetUsers: ["여자친구", "부모님", "배우자"],
    situations: ["생일", "기념일", "효도"], strengths: ["경험을 선물", "높은 감성 만족도"], cautions: ["지역과 예약 가능일 확인"],
    emotionalScore: 98, practicalScore: 60, valueScore: 68, riskScore: 36, description: "도심 호텔에서 휴식 경험을 선물하는 스파 바우처"
  },
  {
    id: "digital-01", name: "13인치 경량 노트북", category: "전자기기", price: 990000,
    tags: ["노트북", "개발", "공부", "휴대", "업무"], targetUsers: ["개발자", "학생", "직장인"],
    situations: ["개발 공부", "업무", "취업 준비"], strengths: ["휴대성", "문서·웹 개발에 충분한 성능"], cautions: ["고사양 그래픽 작업에는 제한"],
    emotionalScore: 72, practicalScore: 95, valueScore: 88, riskScore: 32, description: "개발 입문과 일상 업무에 균형 잡힌 경량 노트북"
  },
  {
    id: "digital-02", name: "노이즈 캔슬링 헤드폰", category: "전자기기", price: 329000,
    tags: ["음악", "집중", "여행", "개발", "선물"], targetUsers: ["직장인", "개발자", "여행자"],
    situations: ["업무", "공부", "여행", "생일"], strengths: ["집중 환경 조성", "긴 배터리"], cautions: ["착용감은 개인차가 큼"],
    emotionalScore: 88, practicalScore: 90, valueScore: 77, riskScore: 24, description: "집중과 이동 시간을 편안하게 만드는 무선 헤드폰"
  },
  {
    id: "digital-03", name: "스마트워치 라이트", category: "전자기기", price: 249000,
    tags: ["건강", "운동", "선물", "직장인", "부모님"], targetUsers: ["직장인", "부모님", "운동 입문자"],
    situations: ["건강 관리", "생일", "효도"], strengths: ["활동량·수면 확인", "알림 편의성"], cautions: ["스마트폰 호환성 확인"],
    emotionalScore: 82, practicalScore: 91, valueScore: 80, riskScore: 29, description: "일상 건강 기록과 알림을 간편하게 관리하는 스마트워치"
  },
  {
    id: "digital-04", name: "휴대용 빔프로젝터", category: "전자기기", price: 398000,
    tags: ["자취", "캠핑", "영화", "선물", "감성"], targetUsers: ["자취생", "커플", "여행자"],
    situations: ["집들이", "캠핑", "데이트"], strengths: ["공간 활용", "감성적인 시청 경험"], cautions: ["낮에는 화면 밝기 제한"],
    emotionalScore: 94, practicalScore: 74, valueScore: 72, riskScore: 35, description: "작은 공간을 홈시네마로 바꾸는 미니 프로젝터"
  },
  {
    id: "home-01", name: "멀티 에어프라이어", category: "생활/자취", price: 139000,
    tags: ["자취", "요리", "집들이", "실용", "건강"], targetUsers: ["자취생", "신혼부부", "친구"],
    situations: ["자취 시작", "집들이"], strengths: ["간편 조리", "활용도 높은 주방가전"], cautions: ["주방 설치 공간 확인"],
    emotionalScore: 68, practicalScore: 96, valueScore: 91, riskScore: 18, description: "자취 식사의 번거로움을 줄여주는 다기능 조리기"
  },
  {
    id: "home-02", name: "침구 청소기", category: "생활/자취", price: 119000,
    tags: ["자취", "청소", "건강", "실용", "집들이"], targetUsers: ["자취생", "알레르기 민감자", "부모님"],
    situations: ["자취 시작", "집들이", "건강 관리"], strengths: ["침구 위생 관리", "쉬운 사용법"], cautions: ["보관 공간 필요"],
    emotionalScore: 55, practicalScore: 94, valueScore: 87, riskScore: 15, description: "침구의 먼지와 이물질 관리를 돕는 소형 청소기"
  },
  {
    id: "home-03", name: "모듈형 수납 트롤리", category: "생활/자취", price: 49000,
    tags: ["자취", "수납", "인테리어", "집들이", "실용"], targetUsers: ["자취생", "학생", "신혼부부"],
    situations: ["자취 시작", "이사", "집들이"], strengths: ["공간별 이동 가능", "높은 수납 활용도"], cautions: ["무거운 물건 적재 제한"],
    emotionalScore: 70, practicalScore: 93, valueScore: 94, riskScore: 10, description: "좁은 공간을 유연하게 정리하는 이동식 수납장"
  },
  {
    id: "home-04", name: "초음파 미니 가습기", category: "생활/자취", price: 39000,
    tags: ["자취", "사무실", "건강", "실용", "선물"], targetUsers: ["자취생", "직장인", "학생"],
    situations: ["자취 시작", "취업", "겨울 선물"], strengths: ["작은 크기", "부담 없는 가격"], cautions: ["매일 세척 권장"],
    emotionalScore: 66, practicalScore: 84, valueScore: 90, riskScore: 12, description: "침실이나 책상 옆에 두기 좋은 소형 가습기"
  },
  {
    id: "beauty-01", name: "니치 향수 50ml", category: "뷰티/패션", price: 189000,
    tags: ["향수", "여자친구", "남자친구", "기념일", "감성"], targetUsers: ["여자친구", "남자친구", "향수 입문자"],
    situations: ["생일", "기념일", "선물"], strengths: ["높은 선물 만족도", "특별한 브랜드 경험"], cautions: ["향 취향 확인이 중요"],
    emotionalScore: 97, practicalScore: 64, valueScore: 70, riskScore: 45, description: "기억에 남는 향을 선물하는 데일리 니치 향수"
  },
  {
    id: "beauty-02", name: "LED 홈케어 마스크", category: "뷰티/패션", price: 299000,
    tags: ["뷰티", "피부", "여자친구", "부모님", "선물"], targetUsers: ["여자친구", "부모님", "뷰티 관심자"],
    situations: ["생일", "효도", "홈케어"], strengths: ["반복 사용 가능", "프리미엄 선물 인상"], cautions: ["피부 상태와 사용 금기 확인"],
    emotionalScore: 90, practicalScore: 79, valueScore: 72, riskScore: 38, description: "집에서 꾸준히 사용하는 LED 기반 피부 관리 기기"
  },
  {
    id: "beauty-03", name: "캐시미어 블렌드 머플러", category: "뷰티/패션", price: 129000,
    tags: ["패션", "선물", "겨울", "여자친구", "부모님"], targetUsers: ["여자친구", "남자친구", "부모님"],
    situations: ["생일", "기념일", "겨울 선물"], strengths: ["사이즈 부담이 적음", "실용성과 감성의 균형"], cautions: ["선호 색상 확인"],
    emotionalScore: 88, practicalScore: 82, valueScore: 79, riskScore: 22, description: "부드러운 촉감과 단정한 디자인의 겨울 액세서리"
  },
  {
    id: "beauty-04", name: "프리미엄 헤어 드라이어", category: "뷰티/패션", price: 349000,
    tags: ["뷰티", "헤어", "여자친구", "실용", "선물"], targetUsers: ["여자친구", "직장인", "뷰티 관심자"],
    situations: ["생일", "기념일", "이사"], strengths: ["매일 사용", "빠른 건조와 스타일링"], cautions: ["기존 제품 보유 여부 확인"],
    emotionalScore: 86, practicalScore: 94, valueScore: 73, riskScore: 28, description: "매일의 헤어 루틴 시간을 줄이는 고성능 드라이어"
  },
  {
    id: "travel-01", name: "기내용 확장 캐리어", category: "여행", price: 169000,
    tags: ["여행", "출장", "선물", "실용", "휴대"], targetUsers: ["여행자", "직장인", "친구"],
    situations: ["여행 준비", "출장", "생일"], strengths: ["확장 수납", "기내 반입 규격"], cautions: ["항공사별 규격 재확인"],
    emotionalScore: 79, practicalScore: 95, valueScore: 86, riskScore: 16, description: "짧은 여행과 출장을 효율적으로 꾸리는 기내용 캐리어"
  },
  {
    id: "travel-02", name: "여행용 압축 파우치 세트", category: "여행", price: 69000,
    tags: ["여행", "수납", "선물", "실용", "10만원대"], targetUsers: ["여행자", "친구", "자취생"],
    situations: ["여행 준비", "생일", "출장"], strengths: ["짐 부피 절약", "쉬운 분류 수납"], cautions: ["과도한 압축 시 의류 구김"],
    emotionalScore: 68, practicalScore: 96, valueScore: 93, riskScore: 8, description: "여행 짐을 작고 단정하게 정리하는 압축 파우치"
  },
  {
    id: "travel-03", name: "액션 카메라 미니", category: "여행", price: 289000,
    tags: ["여행", "사진", "영상", "선물", "아웃도어"], targetUsers: ["여행자", "친구", "커플"],
    situations: ["여행", "생일", "신혼여행"], strengths: ["생생한 여행 기록", "방수 촬영"], cautions: ["메모리 카드·액세서리 비용"],
    emotionalScore: 95, practicalScore: 76, valueScore: 74, riskScore: 31, description: "여행의 움직임을 손쉽게 기록하는 소형 액션 카메라"
  },
  {
    id: "travel-04", name: "휴대용 보조배터리 20000mAh", category: "여행", price: 79000,
    tags: ["여행", "전자기기", "실용", "출장", "선물"], targetUsers: ["여행자", "직장인", "친구"],
    situations: ["여행 준비", "출장", "생일"], strengths: ["높은 충전 용량", "여러 기기 동시 충전"], cautions: ["항공기 반입 규정 확인"],
    emotionalScore: 62, practicalScore: 98, valueScore: 91, riskScore: 12, description: "이동 중 배터리 걱정을 줄이는 대용량 보조배터리"
  },
  {
    id: "health-01", name: "스마트 혈압계", category: "건강", price: 129000,
    tags: ["건강", "부모님", "효도", "실용", "관리"], targetUsers: ["부모님", "중장년", "건강 관심자"],
    situations: ["효도", "생일", "건강 관리"], strengths: ["간편한 측정 기록", "가족 건강 관리"], cautions: ["의료 진단을 대체하지 않음"],
    emotionalScore: 80, practicalScore: 97, valueScore: 90, riskScore: 14, description: "측정 결과를 앱에 기록할 수 있는 가정용 혈압계"
  },
  {
    id: "health-02", name: "목·어깨 온열 마사지기", category: "건강", price: 99000,
    tags: ["건강", "부모님", "직장인", "피로", "선물"], targetUsers: ["부모님", "직장인", "개발자"],
    situations: ["효도", "생일", "업무 피로"], strengths: ["쉬운 사용", "일상적인 휴식에 도움"], cautions: ["통증 질환이 있으면 전문가 상담"],
    emotionalScore: 84, practicalScore: 91, valueScore: 89, riskScore: 20, description: "앉아서 일한 뒤 목과 어깨의 휴식을 돕는 마사지기"
  },
  {
    id: "health-03", name: "프리미엄 영양제 정기권", category: "건강", price: 159000,
    tags: ["건강", "부모님", "직장인", "선물", "영양"], targetUsers: ["부모님", "직장인", "건강 관심자"],
    situations: ["효도", "생일", "건강 관리"], strengths: ["꾸준한 관리 동기", "맞춤 구성 선택"], cautions: ["복용약과 성분 중복 확인"],
    emotionalScore: 76, practicalScore: 85, valueScore: 75, riskScore: 42, description: "생활 패턴에 맞춰 선택하는 3개월 영양 관리 패키지"
  },
  {
    id: "health-04", name: "수면 케어 조명", category: "건강", price: 89000,
    tags: ["건강", "수면", "자취", "직장인", "선물"], targetUsers: ["직장인", "자취생", "부모님"],
    situations: ["수면 관리", "집들이", "생일"], strengths: ["편안한 취침 루틴", "무드등 활용"], cautions: ["수면 장애 치료 기기가 아님"],
    emotionalScore: 85, practicalScore: 80, valueScore: 83, riskScore: 13, description: "빛의 밝기와 색온도로 취침 루틴을 돕는 조명"
  },
  {
    id: "work-01", name: "기계식 저소음 키보드", category: "개발/업무", price: 149000,
    tags: ["개발", "업무", "키보드", "집중", "선물"], targetUsers: ["개발자", "직장인", "학생"],
    situations: ["개발 공부", "취업", "생일"], strengths: ["편안한 타건", "업무 환경 개선"], cautions: ["키 배열과 스위치 취향 확인"],
    emotionalScore: 83, practicalScore: 93, valueScore: 86, riskScore: 21, description: "오랜 타이핑의 피로와 소음을 줄이는 업무용 키보드"
  },
  {
    id: "work-02", name: "27인치 QHD 모니터", category: "개발/업무", price: 329000,
    tags: ["개발", "업무", "모니터", "생산성", "공부"], targetUsers: ["개발자", "직장인", "학생"],
    situations: ["개발 공부", "재택근무", "취업"], strengths: ["넓은 작업 공간", "선명한 텍스트"], cautions: ["책상 크기와 포트 확인"],
    emotionalScore: 75, practicalScore: 98, valueScore: 90, riskScore: 19, description: "코딩과 멀티태스킹 효율을 높이는 고해상도 모니터"
  },
  {
    id: "work-03", name: "인체공학 사무용 의자", category: "개발/업무", price: 459000,
    tags: ["개발", "업무", "건강", "재택근무", "실용"], targetUsers: ["개발자", "직장인", "학생"],
    situations: ["재택근무", "개발 공부", "이사"], strengths: ["장시간 자세 지원", "세부 조절 기능"], cautions: ["체형별 착좌감 확인 권장"],
    emotionalScore: 72, practicalScore: 99, valueScore: 82, riskScore: 27, description: "장시간 앉아 일하는 사람을 위한 조절형 사무 의자"
  },
  {
    id: "work-04", name: "USB-C 멀티 허브", category: "개발/업무", price: 79000,
    tags: ["개발", "업무", "노트북", "출장", "실용"], targetUsers: ["개발자", "직장인", "학생"],
    situations: ["개발 공부", "업무", "출장"], strengths: ["포트 확장", "휴대성"], cautions: ["노트북 포트 규격 확인"],
    emotionalScore: 58, practicalScore: 97, valueScore: 92, riskScore: 12, description: "노트북의 연결 제약을 해결하는 휴대용 멀티 허브"
  }
];
