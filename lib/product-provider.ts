import { Product, ProductCategory, UserAnalysis } from "@/lib/types";

type NaverShoppingItem = {
  title: string;
  link: string;
  image: string;
  lprice: string;
  mallName: string;
  maker: string;
  brand: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
  productId: string;
};

type NaverShoppingResponse = {
  items?: NaverShoppingItem[];
};

export type CatalogResult = {
  products: Product[];
  groups: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    products: Product[];
  }>;
  provider: "naver";
  label: string;
};

type SearchGroup = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  queries: string[];
};

const categoryKeywords: Array<[ProductCategory, string[]]> = [
  ["개발/업무", ["노트북", "개발", "코딩", "업무", "키보드", "모니터"]],
  ["건강", ["건강", "부모님", "마사지", "운동", "수면"]],
  ["여행", ["여행", "캐리어", "캠핑", "출장"]],
  ["뷰티/패션", ["뷰티", "향수", "패션", "피부", "헤어"]],
  ["생활/자취", ["자취", "집들이", "생활", "주방", "수납"]],
  ["전자기기", ["전자", "헤드폰", "스마트", "카메라", "가전"]],
];

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .trim();
}

function inferCategory(text: string): ProductCategory {
  const match = categoryKeywords.find(([, keywords]) =>
    keywords.some((keyword) => text.includes(keyword)),
  );
  return match?.[0] ?? "선물";
}

function buildSearchGroups(message: string, analysis: UserAnalysis): SearchGroup[] {
  if (analysis.keywords.includes("피로 회복")) {
    return [
      {
        id: "recovery-body",
        title: "몸의 긴장을 풀어주는 회복 아이템",
        subtitle: "뻐근한 몸을 편하게 풀며 짧게 쉬어갈 수 있어요.",
        category: "마사지/온열",
        queries: ["목 어깨 마사지기", "마사지건", "온열 찜질기"],
      },
      {
        id: "recovery-rest",
        title: "집에서 만드는 편안한 휴식",
        subtitle: "빛과 향, 소리로 퇴근 후 휴식 환경을 만들어요.",
        category: "홈/힐링",
        queries: ["수면 무드등", "아로마 디퓨저", "블루투스 스피커"],
      },
      {
        id: "recovery-sleep",
        title: "오늘 밤 잘 자기 위한 준비",
        subtitle: "수면 환경을 정돈해 다음 날의 컨디션을 챙겨요.",
        category: "수면",
        queries: ["수면 조명", "메모리폼 베개", "백색소음기"],
      },
    ];
  }

  if (analysis.keywords.includes("집중")) {
    return [
      {
        id: "focus-audio",
        title: "방해를 줄이는 집중 장비",
        subtitle: "소음과 알림을 줄여 몰입할 수 있는 환경을 만들어요.",
        category: "집중 기기",
        queries: ["노이즈캔슬링 헤드폰", "백색소음기", "집중 타이머"],
      },
      {
        id: "focus-desk",
        title: "손이 편한 데스크 셋업",
        subtitle: "오래 앉아 있어도 편안한 작업 환경을 구성해요.",
        category: "데스크테리어",
        queries: ["기계식 키보드", "모니터 조명", "모니터암"],
      },
      {
        id: "focus-body",
        title: "집중력을 지키는 컨디션 관리",
        subtitle: "자세와 휴식 리듬을 챙겨 지치지 않도록 도와줘요.",
        category: "업무/건강",
        queries: ["인체공학 의자", "발받침대", "목 어깨 마사지기"],
      },
    ];
  }

  if (analysis.keywords.includes("수면")) {
    return [
      {
        id: "sleep-light",
        title: "수면 리듬을 만드는 빛",
        subtitle: "잠들기 전 자극을 줄이고 편안한 분위기를 만들어요.",
        category: "수면 조명",
        queries: ["수면 조명", "스마트 무드등", "일출 알람시계"],
      },
      {
        id: "sleep-comfort",
        title: "몸이 편안한 침실 환경",
        subtitle: "베개와 침구를 바꿔 누웠을 때의 편안함을 높여요.",
        category: "침구/편안함",
        queries: ["메모리폼 베개", "경추 베개", "온열 매트"],
      },
      {
        id: "sleep-sound",
        title: "마음을 차분하게 하는 소리",
        subtitle: "주변 소음을 덮고 일정한 수면 환경을 유지해요.",
        category: "사운드/공기",
        queries: ["백색소음기", "공기청정기", "가습기"],
      },
    ];
  }

  if (analysis.keywords.includes("운동")) {
    return [
      {
        id: "workout-home",
        title: "오늘 바로 시작하는 홈트",
        subtitle: "공간을 많이 차지하지 않고 가볍게 시작할 수 있어요.",
        category: "홈트",
        queries: ["요가 매트", "조절 덤벨", "홈트 밴드 세트"],
      },
      {
        id: "workout-wearable",
        title: "운동을 기록하는 스마트 기기",
        subtitle: "활동량과 심박, 루틴을 기록해 꾸준함을 도와줘요.",
        category: "스마트 운동",
        queries: ["스포츠 스마트워치", "스마트 체중계", "무선 이어폰 운동"],
      },
      {
        id: "workout-recovery",
        title: "운동 후 회복을 위한 아이템",
        subtitle: "운동 뒤 뭉친 근육을 풀고 다음 운동을 준비해요.",
        category: "회복",
        queries: ["마사지건", "폼롤러", "온열 찜질기"],
      },
    ];
  }

  if (analysis.keywords.includes("요리/먹거리")) {
    return [
      {
        id: "food-quick",
        title: "빠르게 한 끼를 만드는 주방가전",
        subtitle: "복잡한 준비 없이 간단한 식사를 만들 수 있어요.",
        category: "간편 요리",
        queries: ["에어프라이어", "멀티쿠커", "샌드위치 메이커"],
      },
      {
        id: "food-cafe",
        title: "집에서 즐기는 카페 시간",
        subtitle: "커피와 디저트로 작은 기분 전환을 만들어 보세요.",
        category: "홈카페",
        queries: ["캡슐 커피머신", "전동 우유거품기", "와플 메이커"],
      },
      {
        id: "food-snack",
        title: "가볍게 즐기는 간식",
        subtitle: "바로 먹거나 간단히 준비할 수 있는 인기 먹거리예요.",
        category: "간식/먹거리",
        queries: ["프리미엄 디저트 세트", "견과류 선물세트", "티 세트"],
      },
    ];
  }

  if (analysis.keywords.includes("휴식/놀이")) {
    return [
      {
        id: "play-digital",
        title: "머리를 비우고 즐기는 디지털 취미",
        subtitle: "짧게 시작해도 몰입감 있게 기분을 전환할 수 있어요.",
        category: "게임/콘텐츠",
        queries: ["휴대용 게임기", "블루투스 게임패드", "미니 빔프로젝터"],
      },
      {
        id: "play-home",
        title: "집에서 느긋하게 쉬는 시간",
        subtitle: "음악과 홈카페로 일상에 작은 휴식 루틴을 만들어요.",
        category: "홈/힐링",
        queries: ["블루투스 스피커", "캡슐 커피머신", "무드 조명"],
      },
      {
        id: "play-outdoor",
        title: "가볍게 밖으로 나가는 취미",
        subtitle: "복잡한 준비 없이 시작할 수 있는 활동을 모았어요.",
        category: "야외/활동",
        queries: ["배드민턴 라켓 세트", "피크닉 매트", "미니 자전거"],
      },
    ];
  }

  if (
    analysis.keywords.length === 0 &&
    (/뭐\s*(살까|사지|할까)|아무거나|추천해줘|요즘 뭐/.test(message) || message.length < 12)
  ) {
    return [
      {
        id: "discovery-fun",
        title: "가볍게 기분을 바꾸는 아이템",
        subtitle: "큰 고민 없이 바로 즐길 수 있는 인기 상품부터 둘러봐요.",
        category: "재미/취미",
        queries: ["휴대용 게임기", "블루투스 스피커", "미니 빔프로젝터"],
      },
      {
        id: "discovery-life",
        title: "일상을 편하게 만드는 아이템",
        subtitle: "사소한 불편을 줄여 만족도가 높은 실용 상품이에요.",
        category: "생활/실용",
        queries: ["무선 청소기", "캡슐 커피머신", "스마트 조명"],
      },
      {
        id: "discovery-self",
        title: "나를 돌보는 작은 투자",
        subtitle: "휴식과 건강을 챙기며 생활 리듬을 바꿔보세요.",
        category: "휴식/건강",
        queries: ["목 어깨 마사지기", "스마트워치", "공기청정기"],
      },
    ];
  }

  const explicitProductTerms = [
    "노트북", "헤드폰", "이어폰", "키보드", "모니터", "향수", "지갑",
    "마사지기", "혈압계", "캐리어", "카메라", "가습기", "에어프라이어",
    "스마트워치", "의자", "드라이어", "프로젝터",
  ].filter((keyword) => message.includes(keyword));
  if (explicitProductTerms.length) {
    const query = explicitProductTerms.slice(0, 2).join(" ");
    if (message.includes("노트북") || message.includes("개발")) {
      return [
        {
          id: "main-device",
          title: "성능과 예산을 맞춘 메인 디바이스",
          subtitle: "요청한 작업을 안정적으로 처리할 수 있는 핵심 장비예요.",
          category: "노트북",
          queries: [query, "개발용 노트북"],
        },
        {
          id: "productivity",
          title: "작업 효율을 높이는 주변기기",
          subtitle: "긴 작업 시간을 더 편하고 효율적으로 만들어 줘요.",
          category: "개발/업무",
          queries: ["QHD 모니터", "기계식 키보드", "노이즈캔슬링 헤드폰"],
        },
        {
          id: "workspace",
          title: "집중할 수 있는 업무 환경",
          subtitle: "책상 환경과 자세까지 함께 개선하는 선택이에요.",
          category: "워크스페이스",
          queries: ["인체공학 사무용 의자", "모니터암", "스탠딩 데스크"],
        },
      ];
    }

    return [
      {
        id: "direct-match",
        title: `${query} 추천`,
        subtitle: "요청한 제품군에서 조건에 가장 가까운 상품이에요.",
        category: inferCategory(query),
        queries: [query],
      },
      {
        id: "practical-match",
        title: "함께 비교할 실용적인 선택",
        subtitle: "비슷한 목적을 더 실용적인 방식으로 해결해요.",
        category: "실용 대안",
        queries: [`${query} 실용적인 제품`, `${query} 인기 상품`],
      },
      {
        id: "premium-match",
        title: "만족도를 높이는 프리미엄 선택",
        subtitle: "품질과 사용 경험을 조금 더 중요하게 본 선택이에요.",
        category: "프리미엄",
        queries: [`${query} 프리미엄`, `${query} 고급`],
      },
    ];
  }

  if (message.includes("여자친구") || message.includes("여친")) {
    return [
      {
        id: "beauty-fashion",
        title: "뷰티·패션으로 마음을 전하는 선물",
        subtitle: "취향을 담기 좋고 생일 선물다운 특별함이 큰 선택이에요.",
        category: "뷰티/패션",
        queries: ["14K 여성 목걸이", "여성 가죽 가방", "프리미엄 여성 향수"],
      },
      {
        id: "smart-device",
        title: "매일 쓰는 프리미엄 디바이스",
        subtitle: "기억에 남는 감성과 꾸준히 쓰는 실용성을 함께 잡았어요.",
        category: "전자기기",
        queries: ["다이슨 에어랩", "애플워치 여성", "노이즈캔슬링 헤드폰"],
      },
      {
        id: "lifestyle",
        title: "취향을 넓혀주는 라이프스타일 선물",
        subtitle: "데이트와 일상에서 새로운 경험을 만들어 주는 상품이에요.",
        category: "선물/라이프",
        queries: ["휴대용 빔프로젝터", "포토 프린터", "프리미엄 커피머신"],
      },
    ];
  }
  if (message.includes("남자친구") || message.includes("남친")) {
    return [
      {
        id: "fashion",
        title: "센스 있는 패션 선물",
        subtitle: "매일 사용할 수 있으면서 선물의 인상도 분명한 선택이에요.",
        category: "뷰티/패션",
        queries: ["남성 프리미엄 향수", "남성 가죽 지갑"],
      },
      {
        id: "device",
        title: "취향을 업그레이드하는 디바이스",
        subtitle: "음악과 건강 관리 등 일상의 만족도를 높여줘요.",
        category: "전자기기",
        queries: ["노이즈캔슬링 헤드폰", "남성 스마트워치"],
      },
      {
        id: "hobby",
        title: "취미 시간을 즐겁게 만드는 선물",
        subtitle: "평소 관심사와 여가 시간을 풍성하게 해주는 선택이에요.",
        category: "취미/라이프",
        queries: ["휴대용 게임기", "캠핑 장비", "홈카페 커피머신"],
      },
    ];
  }
  if (analysis.keywords.includes("부모님")) {
    return [
      {
        id: "health",
        title: "매일 챙기는 건강 선물",
        subtitle: "부담 없이 꾸준히 활용할 수 있는 건강 관리 상품이에요.",
        category: "건강",
        queries: ["프리미엄 마사지기", "스마트 혈압계"],
      },
      {
        id: "smart-health",
        title: "편리한 스마트 건강 기기",
        subtitle: "건강 기록과 생활 편의를 함께 챙길 수 있어요.",
        category: "전자기기",
        queries: ["건강관리 스마트워치", "수면 케어 기기"],
      },
      {
        id: "rest",
        title: "편안한 일상을 위한 휴식 선물",
        subtitle: "집에서 자주 사용하며 편안함을 느낄 수 있는 상품이에요.",
        category: "생활/휴식",
        queries: ["프리미엄 안마기", "온열 찜질기", "수면 조명"],
      },
    ];
  }

  if (analysis.keywords.includes("여행")) {
    return [
      {
        id: "travel-gear",
        title: "여행을 편하게 만드는 기본 장비",
        subtitle: "짐을 꾸리고 이동하는 과정의 번거로움을 줄여줘요.",
        category: "여행용품",
        queries: ["프리미엄 기내용 캐리어", "여행 압축 파우치", "여행용 백팩"],
      },
      {
        id: "travel-device",
        title: "여행 기록과 이동을 위한 디바이스",
        subtitle: "사진과 충전, 이동 시간을 더 즐겁게 만들어 줘요.",
        category: "전자기기",
        queries: ["액션 카메라", "휴대용 포토 프린터", "대용량 보조배터리"],
      },
      {
        id: "travel-comfort",
        title: "여행의 피로를 줄이는 아이템",
        subtitle: "장거리 이동과 낯선 숙소에서도 편안함을 챙겨줘요.",
        category: "여행/휴식",
        queries: ["노이즈캔슬링 헤드폰", "여행용 목베개", "휴대용 마사지기"],
      },
    ];
  }

  if (analysis.keywords.includes("자취")) {
    return [
      {
        id: "home-kitchen",
        title: "매일 쓰는 주방 아이템",
        subtitle: "식사 준비를 간단하게 만들어 주는 자취 필수품이에요.",
        category: "주방가전",
        queries: ["에어프라이어", "전자레인지", "소형 커피머신"],
      },
      {
        id: "home-living",
        title: "공간을 깔끔하게 만드는 생활용품",
        subtitle: "작은 집을 더 넓고 쾌적하게 사용할 수 있어요.",
        category: "생활/수납",
        queries: ["무선 청소기", "모듈 수납장", "공기청정기"],
      },
      {
        id: "home-mood",
        title: "집의 분위기를 바꾸는 아이템",
        subtitle: "자취방에 취향과 휴식을 더하는 선택이에요.",
        category: "홈/취향",
        queries: ["휴대용 빔프로젝터", "무드 조명", "블루투스 스피커"],
      },
    ];
  }

  if (analysis.keywords.includes("건강")) {
    return [
      {
        id: "health-care",
        title: "꾸준히 관리하는 건강 기기",
        subtitle: "일상에서 건강 상태를 확인하고 기록할 수 있어요.",
        category: "건강",
        queries: ["스마트 혈압계", "체성분 체중계", "건강 스마트워치"],
      },
      {
        id: "recovery",
        title: "피로 회복을 위한 홈케어",
        subtitle: "집에서 편하게 긴장과 피로를 풀 수 있는 상품이에요.",
        category: "마사지/회복",
        queries: ["목 어깨 마사지기", "온열 찜질기", "마사지건"],
      },
      {
        id: "wellness",
        title: "생활 습관을 돕는 웰니스 아이템",
        subtitle: "수면과 운동 등 건강한 생활 리듬을 만들어 줘요.",
        category: "웰니스",
        queries: ["수면 조명", "요가 매트", "공기청정기"],
      },
    ];
  }

  if (analysis.keywords.includes("뷰티")) {
    return [
      {
        id: "skin-care",
        title: "피부를 위한 홈케어",
        subtitle: "집에서 꾸준히 관리할 수 있는 뷰티 디바이스예요.",
        category: "스킨케어",
        queries: ["LED 마스크", "고주파 피부관리기", "갈바닉 마사지기"],
      },
      {
        id: "hair-beauty",
        title: "매일 사용하는 헤어 뷰티",
        subtitle: "스타일링 시간과 완성도를 함께 개선해 줘요.",
        category: "헤어",
        queries: ["프리미엄 헤어드라이어", "에어 스타일러", "고데기"],
      },
      {
        id: "beauty-style",
        title: "취향을 표현하는 스타일 아이템",
        subtitle: "향과 액세서리로 자신만의 분위기를 완성해요.",
        category: "향수/패션",
        queries: ["프리미엄 여성 향수", "여성 주얼리", "여성 가죽 지갑"],
      },
    ];
  }

  const target = ["여자친구", "남자친구", "부모님", "친구"].find((keyword) =>
    message.includes(keyword),
  );
  if (target) {
    return [
      {
        id: "gift-match",
        title: `${target}을 위한 감성 선물`,
        subtitle: `${analysis.occasion}의 의미를 잘 전할 수 있는 상품이에요.`,
        category: "감성 선물",
        queries: [`${target} ${analysis.occasion} 감성 선물`],
      },
      {
        id: "gift-practical",
        title: `${target}을 위한 실용 선물`,
        subtitle: "받은 뒤 자주 사용할 수 있는 상품을 골랐어요.",
        category: "실용 선물",
        queries: [`${target} 실용적인 선물`],
      },
      {
        id: "gift-experience",
        title: `${target}의 취향을 위한 선물`,
        subtitle: "취미와 일상에 새로운 즐거움을 더해줘요.",
        category: "취향 선물",
        queries: [`${target} 취향 선물`, `${target} 인기 선물`],
      },
    ];
  }

  const query = message
    .replace(/\d+(?:\.\d+)?\s*(?:만원|원|억)/g, "")
    .replace(/추천(?:해줘|해주세요)?/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  return [
    {
      id: "general",
      title: "목적에 가장 가까운 선택",
      subtitle: "입력한 상황과 예산을 우선으로 고려했어요.",
      category: "맞춤 추천",
      queries: [query],
    },
    {
      id: "general-practical",
      title: "활용도를 높인 실용적인 선택",
      subtitle: "구매 후 자주 사용할 수 있는 상품을 중심으로 봤어요.",
      category: "실용 추천",
      queries: [`${query} 실용적인 제품`],
    },
    {
      id: "general-premium",
      title: "만족도를 높인 프리미엄 선택",
      subtitle: "품질과 경험을 조금 더 중요하게 고려했어요.",
      category: "프리미엄",
      queries: [`${query} 프리미엄`],
    },
  ];
}

function isLowQualityItem(item: NaverShoppingItem): boolean {
  const text = stripHtml(`${item.title} ${item.mallName}`).toLowerCase();
  return [
    "렌탈", "대여", "중고", "리퍼", "해외직구", "구매대행", "도서",
    "강의", "교육", "학원", "부품", "케이스", "보호필름",
    "이벤트용품", "파티용품", "촛불", "캔들 숫자", "케이크 토퍼",
    "현수막", "풍선", "프로포즈 용품", "답프로포즈", "용돈박스",
    "포장지", "쇼핑백", "스티커", "엽서",
  ].some((keyword) => text.includes(keyword));
}

const productTermGroups: string[][] = [
  ["노트북", "랩탑", "맥북"],
  ["모니터", "디스플레이"],
  ["키보드"],
  ["헤드폰", "헤드셋"],
  ["이어폰"],
  ["의자", "체어"],
  ["모니터암", "모니터 암"],
  ["스탠딩 데스크", "높이조절 책상", "높이 조절 책상"],
  ["향수", "오드퍼퓸", "오드뚜왈렛"],
  ["목걸이", "네크리스"],
  ["가방", "백"],
  ["지갑"],
  ["에어랩", "에어 스타일러", "스타일러"],
  ["스마트워치", "애플워치", "갤럭시워치"],
  ["빔프로젝터", "프로젝터"],
  ["포토 프린터", "포토프린터"],
  ["커피머신", "에스프레소 머신"],
  ["마사지기", "안마기", "마사지건"],
  ["혈압계"],
  ["캐리어", "여행가방"],
  ["카메라"],
  ["보조배터리"],
  ["청소기"],
  ["공기청정기"],
  ["에어프라이어"],
  ["전자레인지"],
  ["조명", "무드등"],
  ["스피커"],
];

function isRelevantToQuery(item: NaverShoppingItem, query: string): boolean {
  const title = stripHtml(item.title).toLowerCase();
  const searchable = stripHtml([
    title,
    item.category1,
    item.category2,
    item.category3,
    item.category4,
  ].join(" ")).toLowerCase();
  const normalizedQuery = query.toLowerCase();

  const requiredGroup = productTermGroups.find((terms) =>
    terms.some((term) => normalizedQuery.includes(term)),
  );
  if (!requiredGroup) return true;

  if (requiredGroup.includes("노트북")) {
    return requiredGroup.some((term) => title.includes(term));
  }

  return requiredGroup.some((term) => searchable.includes(term));
}

function isInBudgetRange(
  item: NaverShoppingItem,
  message: string,
  budget: number | null,
): boolean {
  const price = Number(item.lprice);
  if (!price) return false;
  if (!budget) {
    return price >= 10000 && price <= 900000;
  }

  if (message.includes("이하")) return price <= budget && price >= budget * 0.15;
  const priceBand = message.match(/(\d+)\s*만원대/);
  if (priceBand) {
    const amount = priceBand[1];
    const bandSize = 10 ** Math.max(0, amount.length - 1) * 10000;
    return price >= budget && price < budget + bandSize;
  }
  return price >= budget * 0.3 && price <= budget * 1.35;
}

function mapNaverItem(item: NaverShoppingItem, query: string): Product {
  const name = stripHtml(item.title);
  const categoryText = [
    item.category1,
    item.category2,
    item.category3,
    item.category4,
    query,
  ].join(" ");
  const category = inferCategory(categoryText);
  const mallName = stripHtml(item.mallName || "네이버 쇼핑");
  const brand = stripHtml(item.brand || item.maker || "");

  return {
    id: `naver-${item.productId || encodeURIComponent(name)}`,
    name,
    category,
    price: Number(item.lprice) || 0,
    tags: [query, category, brand, mallName].filter(Boolean),
    targetUsers: ["온라인 쇼핑 사용자"],
    situations: [query, "실시간 상품 탐색"],
    strengths: ["현재 판매 중인 상품 정보", `${mallName} 판매 페이지로 바로 이동`],
    cautions: ["판매처에서 최종 가격과 재고 확인", "옵션에 따라 가격이 달라질 수 있음"],
    emotionalScore: category === "선물" || category === "뷰티/패션" ? 84 : 72,
    practicalScore: ["전자기기", "생활/자취", "개발/업무"].includes(category) ? 90 : 80,
    valueScore: 82,
    riskScore: 24,
    description: `${mallName}에서 판매 중인 ${brand ? `${brand} ` : ""}${category} 상품`,
    imageUrl: item.image,
    productUrl: item.link,
    mallName,
    brand: brand || undefined,
    source: "naver",
    isLive: true,
  };
}

export async function searchLiveProducts(
  message: string,
  analysis: UserAnalysis,
): Promise<CatalogResult | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const searchGroups = buildSearchGroups(message, analysis);
  if (!searchGroups.length) return null;

  try {
    const responses = await Promise.all(
      searchGroups.flatMap((group) => group.queries.map(async (query) => {
        const params = new URLSearchParams({
          query,
          display: "100",
          start: "1",
          sort: "sim",
          exclude: "used:rental:cbshop",
        });
        const response = await fetch(
          `https://openapi.naver.com/v1/search/shop.json?${params.toString()}`,
          {
            headers: {
              "X-Naver-Client-Id": clientId,
              "X-Naver-Client-Secret": clientSecret,
            },
            signal: AbortSignal.timeout(6000),
            next: { revalidate: 900 },
          },
        );
        if (!response.ok) return [];
        const data = (await response.json()) as NaverShoppingResponse;
        return (data.items ?? []).map((item, rank) => ({
          item,
          query,
          groupId: group.id,
          rank,
        }));
      })),
    );

    const groups = searchGroups
      .map((group) => {
        const seen = new Set<string>();
        const products = responses
          .flat()
          .filter((entry) => entry.groupId === group.id)
          .filter(({ item }) => !isLowQualityItem(item))
          .filter(({ item, query }) => isRelevantToQuery(item, query))
          .filter(({ item }) =>
            isInBudgetRange(item, message, analysis.budgetValue),
          )
          .filter(({ item }) => {
            const key =
              item.productId || `${stripHtml(item.title)}-${item.lprice}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map(({ item, query, rank }) => ({
            ...mapNaverItem(item, query),
            popularityRank: rank,
          }))
          .filter((product) => product.price > 0 && product.productUrl);

        return { ...group, products };
      })
      .filter((group) => group.products.length >= 3);

    const uniqueProducts = new Map<string, Product>();
    groups
      .flatMap((group) => group.products)
      .forEach((product) => uniqueProducts.set(product.id, product));
    const products = Array.from(uniqueProducts.values());

    return groups.length
      ? { products, groups, provider: "naver", label: "네이버 쇼핑 실시간 상품" }
      : null;
  } catch (error) {
    console.error("[catalog] Naver shopping search failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return null;
  }
}
