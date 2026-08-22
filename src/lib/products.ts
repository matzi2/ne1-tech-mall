export type ProductCategory =
  | "distribution"
  | "control"
  | "switch"
  | "component";

export type Product = {
  slug: string;
  sku: string;
  name: string;
  summary: string;
  description: string;
  category: ProductCategory;
  price: number | null;
  leadTime: string;
  specs: { label: string; value: string }[];
  stock: "in-stock" | "made-to-order" | "limited";
  featured?: boolean;
};

export const categories: {
  id: ProductCategory | "all";
  label: string;
  description: string;
}[] = [
  { id: "all", label: "전체", description: "엔이원텍 표준·맞춤 제품" },
  {
    id: "distribution",
    label: "배전반",
    description: "분전반 · MCC · 조명반",
  },
  {
    id: "control",
    label: "자동제어반",
    description: "PLC · 인버터 · ATS",
  },
  {
    id: "switch",
    label: "전자식 스위치",
    description: "모터보호 · 타이머 · 과부하 · SSR",
  },
  {
    id: "component",
    label: "전자부품",
    description: "차단기 · 접촉기 · 전원 · 단자",
  },
];

export const products: Product[] = [
  {
    slug: "nei-db-30",
    sku: "NE1-DB-30",
    name: "표준 분전반 30회로",
    summary: "사무실·소규모 공장용 벽부형 분전반. 주차단기 100A 기준.",
    description:
      "엔이원텍 표준 분전반입니다. 주차단기 100A, 분기 30회로 구성으로 사무실, 창고, 소규모 생산라인에 바로 설치할 수 있습니다. 함체 재질은 도장 강판이며, 회로 라벨과 결선도가 함께 출고됩니다. 분기 차단기 용량은 주문 시 지정할 수 있습니다.",
    category: "distribution",
    price: 980000,
    leadTime: "제작 7~10일",
    stock: "made-to-order",
    featured: true,
    specs: [
      { label: "형식", value: "벽부형 분전반" },
      { label: "주차단기", value: "MCCB 3P 100A" },
      { label: "분기회로", value: "30회로" },
      { label: "함체", value: "도장 강판, IP3X" },
      { label: "정격전압", value: "AC 380/220V" },
    ],
  },
  {
    slug: "nei-mcc-a",
    sku: "NE1-MCC-A",
    name: "모터제어반 MCC Type-A",
    summary: "인출형 유닛 구조의 모터제어반. 용량·회로는 현장 사양서 기준.",
    description:
      "펌프, 팬, 컨베이어 등 다회로 모터를 한 함체에서 제어하는 MCC입니다. 인출형 유닛으로 유지보수가 쉽고, 과부하·결상 보호와 운전 표시등을 기본 포함합니다. 최종 가격은 모터 대수와 용량에 따라 견적으로 확정합니다.",
    category: "distribution",
    price: null,
    leadTime: "설계 협의 후 3~5주",
    stock: "made-to-order",
    featured: true,
    specs: [
      { label: "형식", value: "인출형 MCC" },
      { label: "적용", value: "펌프·팬·컨베이어" },
      { label: "보호", value: "과부하 · 결상 · 지락" },
      { label: "통신", value: "옵션 (Modbus)" },
      { label: "인증대응", value: "현장 전기안전 점검 도면 제공" },
    ],
  },
  {
    slug: "nei-lp-200",
    sku: "NE1-LP-200",
    name: "조명분전반 200A",
    summary: "공장·물류창고 조명 회로용. 주차단기 200A, 분기 24회로.",
    description:
      "고천장 조명과 비상조명을 분리 회로로 구성한 조명분전반입니다. 주차단기 200A, LED 조명 부하에 맞춘 분기 차단기를 기본 탑재합니다. 야간 점등 스케줄용 타이머 회로를 옵션으로 넣을 수 있습니다.",
    category: "distribution",
    price: 1480000,
    leadTime: "제작 10~14일",
    stock: "made-to-order",
    specs: [
      { label: "주차단기", value: "MCCB 3P 200A" },
      { label: "분기회로", value: "24회로" },
      { label: "부하", value: "LED 조명 · 비상등" },
      { label: "옵션", value: "전자식 타이머 회로" },
    ],
  },
  {
    slug: "nei-plc-s",
    sku: "NE1-PLC-S",
    name: "PLC 자동제어반 Standard",
    summary: "소형 공정용 표준 PLC 제어반. I/O 확장과 터치패널 옵션.",
    description:
      "포장기, 이송라인, 단순 시퀀스 공정에 쓰는 표준 PLC 제어반입니다. 기본 I/O와 비상정지, 안전릴레이를 포함하고, 터치패널과 통신 모듈은 옵션입니다. 래더 소스와 I/O 리스트를 납품 시 함께 전달합니다.",
    category: "control",
    price: 3200000,
    leadTime: "제작 14~21일",
    stock: "made-to-order",
    featured: true,
    specs: [
      { label: "PLC", value: "표준 컴팩트 PLC" },
      { label: "I/O", value: "DI 16 / DO 16 기본" },
      { label: "HMI", value: "7인치 터치 옵션" },
      { label: "전원", value: "AC 220V → DC 24V" },
      { label: "납품물", value: "도면 · 프로그램 · 시운전 체크리스트" },
    ],
  },
  {
    slug: "nei-inv-22",
    sku: "NE1-INV-22",
    name: "인버터 제어반 22kW",
    summary: "팬·펌프 변속 운전용 22kW 인버터 함체. 필터·리액터 포함.",
    description:
      "22kW급 모터의 변속 운전을 위한 인버터 제어반입니다. 노이즈 필터, 리액터, 냉각팬, 로컬/원격 전환 스위치를 기본 구성합니다. 현장 모터 정격과 가감속 시간은 출고 전 세팅표로 맞춥니다.",
    category: "control",
    price: 2750000,
    leadTime: "제작 10~14일",
    stock: "made-to-order",
    featured: true,
    specs: [
      { label: "용량", value: "22kW" },
      { label: "입력", value: "3상 380V" },
      { label: "구성", value: "인버터 · 필터 · 리액터" },
      { label: "조작", value: "로컬 / 원격 전환" },
    ],
  },
  {
    slug: "nei-ats-100",
    sku: "NE1-ATS-100",
    name: "자동절체 스위치반 100A",
    summary: "한전·발전기 절체용 ATS반. 정전 시 자동 전환.",
    description:
      "상용전원과 비상발전기 사이를 자동 절체하는 100A ATS반입니다. 절체 시간, 복전 지연, 시험 스위치를 전면에 배치했습니다. 소규모 전산실, 저온창고, 필수 공정 전원 백업에 사용합니다.",
    category: "control",
    price: 2100000,
    leadTime: "제작 14일",
    stock: "made-to-order",
    specs: [
      { label: "정격", value: "100A 3P" },
      { label: "기능", value: "정전 자동절체 · 복전 복귀" },
      { label: "시험", value: "전면 시험 스위치" },
      { label: "표시", value: "상용 / 비상 / 이상" },
    ],
  },
  {
    slug: "nei-esr-10",
    sku: "NE1-ESR-10",
    name: "전자식 모터 보호 스위치 10A",
    summary: "소형 모터용 전자식 보호 스위치. 과부하·결상 검출.",
    description:
      "0.75~2.2kW 소형 모터에 쓰는 전자식 보호 스위치입니다. 열동형 대비 반복 특성이 안정적이고, 결상과 구속을 전자식으로 검출합니다. DIN 레일 취부.",
    category: "switch",
    price: 68000,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "정격전류", value: "10A" },
      { label: "보호", value: "과부하 · 결상 · 구속" },
      { label: "취부", value: "DIN 레일" },
      { label: "접점", value: "1NO + 1NC" },
    ],
  },
  {
    slug: "nei-etr-24",
    sku: "NE1-ETR-24",
    name: "전자식 타이머 릴레이 24V",
    summary: "온딜레이·오프딜레이 전환. DC 24V 제어전원.",
    description:
      "제어반 시퀀스에 넣는 다기능 전자식 타이머입니다. 온딜레이, 오프딜레이, 플리커 모드를 다이얼로 전환합니다. DC 24V 코일, 다이얼 스케일 0.1초~10분.",
    category: "switch",
    price: 27500,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    specs: [
      { label: "코일", value: "DC 24V" },
      { label: "모드", value: "온/오프딜레이 · 플리커" },
      { label: "시간범위", value: "0.1s ~ 10min" },
      { label: "접점", value: "2C" },
    ],
  },
  {
    slug: "nei-eol-32",
    sku: "NE1-EOL-32",
    name: "전자식 과부하 계전기 32A",
    summary: "전자접촉기 조합용 전자식 과부하 계전기.",
    description:
      "18~32A 모터 범위에 맞춘 전자식 과부하 계전기입니다. 클래스 10/20 선택, 위상 불평형 검출, 수동/자동 리셋을 지원합니다. 엔이원텍 전자접촉기 NE1-MC 시리즈와 바로 조합됩니다.",
    category: "switch",
    price: 54000,
    leadTime: "재고 1~3일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "전류범위", value: "18~32A" },
      { label: "트립클래스", value: "10 / 20" },
      { label: "리셋", value: "수동 / 자동" },
      { label: "조합", value: "NE1-MC 시리즈" },
    ],
  },
  {
    slug: "nei-ssr-40",
    sku: "NE1-SSR-40",
    name: "솔리드스테이트 릴레이 40A",
    summary: "무접점 스위칭. 히터·조명 부하용 단상 40A.",
    description:
      "접점 마모 없이 히터와 조명 부하를 제어하는 단상 SSR입니다. 방열판 포함 키트로 출고되며, 입력 DC 3~32V, 출력 AC 24~240V입니다. 제어반 내부 발열을 고려한 이격 거리를 매뉴얼에 표기했습니다.",
    category: "switch",
    price: 41000,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    specs: [
      { label: "출력", value: "40A / AC 24~240V" },
      { label: "입력", value: "DC 3~32V" },
      { label: "구성", value: "SSR + 방열판" },
      { label: "부하", value: "히터 · 조명" },
    ],
  },
  {
    slug: "nei-mccb-3p100",
    sku: "NE1-MCCB-3P100",
    name: "배선용차단기 3P 100A",
    summary: "분전반·MCC 주차단기용 3극 100A MCCB.",
    description:
      "산업용 분전반과 MCC 인입단에 쓰는 3극 100A 배선용차단기입니다. 차단용량 50kA(380V), 열동·전자식 트립. 엔이원텍 표준 분전반 NE1-DB-30의 주차단기와 동일 사양입니다.",
    category: "component",
    price: 89000,
    leadTime: "재고 당일~1일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "극수", value: "3P" },
      { label: "정격전류", value: "100A" },
      { label: "차단용량", value: "50kA @ 380V" },
      { label: "트립", value: "열동 · 전자식" },
    ],
  },
  {
    slug: "nei-elcb-2p30",
    sku: "NE1-ELCB-2P30",
    name: "누전차단기 2P 30A",
    summary: "감도 30mA, 고감도 누전차단기. 콘센트·조명 분기용.",
    description:
      "단상 부하 보호용 2극 30A 누전차단기입니다. 감도전류 30mA, 동작시간 0.03초 이내. 화장실, 옥외, 콘센트 회로 분기에 사용합니다.",
    category: "component",
    price: 18500,
    leadTime: "재고 당일~1일",
    stock: "in-stock",
    specs: [
      { label: "극수", value: "2P" },
      { label: "정격전류", value: "30A" },
      { label: "감도", value: "30mA" },
      { label: "동작", value: "0.03s 이내" },
    ],
  },
  {
    slug: "nei-mc-18",
    sku: "NE1-MC-18",
    name: "전자접촉기 18A",
    summary: "AC3 7.5kW(380V)급 전자접촉기. 코일 AC 220V.",
    description:
      "7.5kW 모터 기동용 전자접촉기입니다. 주접점 3극, 보조접점 1NO+1NC, 코일 AC 220V. 엔이원텍 전자식 과부하 계전기와 조합해 모터 스타터를 구성할 수 있습니다.",
    category: "component",
    price: 32000,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    specs: [
      { label: "정격", value: "18A / AC3 7.5kW" },
      { label: "코일", value: "AC 220V" },
      { label: "보조접점", value: "1NO + 1NC" },
      { label: "조합", value: "NE1-EOL 시리즈" },
    ],
  },
  {
    slug: "nei-smps-2410",
    sku: "NE1-SMPS-2410",
    name: "스위칭전원 24V 10A",
    summary: "제어반 내부 DC 24V 공급용 DIN 레일 SMPS.",
    description:
      "PLC, 센서, 릴레이 코일에 쓰는 DIN 레일형 24V 10A 스위칭전원입니다. 입력 AC 85~264V, 과전류·과전압 보호, 전면 출력 표시 LED를 갖췄습니다.",
    category: "component",
    price: 47000,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "출력", value: "DC 24V 10A" },
      { label: "입력", value: "AC 85~264V" },
      { label: "취부", value: "DIN 레일" },
      { label: "보호", value: "과전류 · 과전압" },
    ],
  },
  {
    slug: "nei-tb-20",
    sku: "NE1-TB-20",
    name: "단자대 20P",
    summary: "제어배선용 20극 단자대. 10mm²까지.",
    description:
      "제어반 내부 단자대입니다. 20극, 전선 10mm²까지, 커버와 마킹 스트립 포함. 엔이원텍 표준 분전반·제어반 내부 배선과 동일한 피치입니다.",
    category: "component",
    price: 12500,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "극수", value: "20P" },
      { label: "전선", value: "최대 10mm²" },
      { label: "구성", value: "커버 · 마킹 스트립" },
      { label: "취부", value: "DIN 레일" },
    ],
  },
  {
    slug: "nei-sp-24",
    sku: "NE1-SP-24",
    name: "서지보호기 24V",
    summary: "제어전원·신호선용 24V SPD. DIN 레일형.",
    description:
      "DC 24V 제어전원과 신호선을 낙뢰·서지로부터 보호하는 SPD입니다. 응답시간 1ns급, 상태 표시창, DIN 레일 취부. PLC 입력단 전단에 권장합니다.",
    category: "component",
    price: 36000,
    leadTime: "재고 1~3일",
    stock: "limited",
    specs: [
      { label: "정격", value: "DC 24V" },
      { label: "응답", value: "1ns급" },
      { label: "표시", value: "정상 / 수명 경고" },
      { label: "취부", value: "DIN 레일" },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((item) => item.slug === slug);
}

export function getProductsByCategory(category: ProductCategory | "all") {
  if (category === "all") return products;
  return products.filter((item) => item.category === category);
}

export function getFeaturedProducts() {
  return products.filter((item) => item.featured);
}

export function getCategoryLabel(id: ProductCategory) {
  return categories.find((item) => item.id === id)?.label ?? id;
}

export function searchProducts(query: string, category: ProductCategory | "all") {
  const list = getProductsByCategory(category);
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((item) =>
    [item.name, item.sku, item.summary, item.description].some((field) =>
      field.toLowerCase().includes(q),
    ),
  );
}
