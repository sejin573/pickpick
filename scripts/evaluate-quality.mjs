const baseUrl =
  process.env.PICKPICK_URL ?? "https://pickpick-five.vercel.app";

const cases = [
  {
    message: "사무실 작은 식물",
    required: /식물|화분|다육|스투키|야자|몬스테라|세베리아/,
    forbidden: /수면|조명|인조|조화|덮개|커버|재배등/,
  },
  {
    message: "부모님께 드릴 20만원대 건강 선물",
    required: /마사지|안마|찜질|온열|케어 패드|혈압|체중|건강|워치/,
    forbidden: /산업용|업소용|탐지기|열화상|호환필터|교체용/,
  },
  {
    message: "개발 공부용 노트북 예산 100만원 이하",
    required:
      /노트북|랩탑|맥북|갤럭시북|울트라북|아이디어패드|그램|ExpertBook/,
    forbidden: /케이스|보호필름|부품/,
  },
  {
    message: "잠이 안 와",
    required:
      /수면|숙면|안대|아이마스크|무드등|베개|필로우|침구|매트리스|백색소음|사운드머신|가습기|공기청정|귀마개/,
    forbidden: /아기|신생아|어린이|키즈|멜라토닌|영양제/,
  },
];

let failed = false;

for (const testCase of cases) {
  const response = await fetch(`${baseUrl}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: testCase.message }),
  });
  if (!response.ok) {
    console.error(`FAIL ${testCase.message}: HTTP ${response.status}`);
    failed = true;
    continue;
  }

  const data = await response.json();
  const firstBand = data.priceBands?.[0]?.id;
  const groups = data.recommendationGroups?.length
    ? data.recommendationGroups.filter(
        (group) => !firstBand || group.priceBand === firstBand,
      )
    : [{ recommendations: data.recommendations ?? [] }];
  const names = groups
    .flatMap((group) => group.recommendations ?? [])
    .slice(0, 15)
    .map((item) => item.name);

  const unrelated = names.filter((name) => !testCase.required.test(name));
  const forbidden = names.filter((name) => testCase.forbidden.test(name));

  if (!names.length || unrelated.length || forbidden.length) {
    console.error(`FAIL ${testCase.message}`);
    if (unrelated.length) {
      console.error(`  unrelated: ${unrelated.join(" / ")}`);
    }
    if (forbidden.length) console.error(`  forbidden: ${forbidden.join(" / ")}`);
    failed = true;
  } else {
    console.log(`PASS ${testCase.message} (${names.length} products)`);
  }
}

if (failed) process.exitCode = 1;
