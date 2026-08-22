export type ProductCategory =
  | "breaker"
  | "elcb"
  | "contactor"
  | "power"
  | "terminal"
  | "surge"
  | "relay"
  | "fuse";

export const categories: {
  id: ProductCategory | "all";
  label: string;
  description: string;
}[] = [
  { id: "all", label: "전체", description: "엔이원텍 전자부품 전체" },
  { id: "breaker", label: "배선용차단기", description: "MCCB · 주차단기" },
  { id: "elcb", label: "누전차단기", description: "ELCB · 감전 보호" },
  { id: "contactor", label: "전자접촉기", description: "모터 기동 · 부하 개폐" },
  { id: "power", label: "전원장치", description: "SMPS · 제어전원" },
  { id: "terminal", label: "단자대", description: "제어배선 · DIN 레일" },
  { id: "surge", label: "서지보호기", description: "SPD · 낙뢰 보호" },
  { id: "relay", label: "보조릴레이", description: "제어 접점 · 신호 분기" },
  { id: "fuse", label: "퓨즈·홀더", description: "회로 보호 퓨즈" },
];

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

export const products: Product[] = [
  {
    slug: "nei-mccb-3p100",
    sku: "NE1-MCCB-3P100",
    name: "배선용차단기 3P 100A",
    summary: "산업용 인입·분기용 3극 100A MCCB.",
    description:
      "산업 현장 인입단과 분기에 쓰는 3극 100A 배선용차단기입니다. 차단용량 50kA(380V), 열동·전자식 트립.",
    category: "breaker",
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
    slug: "nei-mccb-3p50",
    sku: "NE1-MCCB-3P50",
    name: "배선용차단기 3P 50A",
    summary: "소용량 분기용 3극 50A MCCB.",
    description:
      "소용량 모터·히터 분기에 쓰는 3극 50A 배선용차단기입니다. 차단용량 35kA(380V).",
    category: "breaker",
    price: 62000,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    specs: [
      { label: "극수", value: "3P" },
      { label: "정격전류", value: "50A" },
      { label: "차단용량", value: "35kA @ 380V" },
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
    category: "elcb",
    price: 18500,
    leadTime: "재고 당일~1일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "극수", value: "2P" },
      { label: "정격전류", value: "30A" },
      { label: "감도", value: "30mA" },
      { label: "동작", value: "0.03s 이내" },
    ],
  },
  {
    slug: "nei-elcb-4p40",
    sku: "NE1-ELCB-4P40",
    name: "누전차단기 4P 40A",
    summary: "삼상 부하용 4극 40A 누전차단기. 감도 30mA.",
    description:
      "삼상 설비 보호용 4극 40A 누전차단기입니다. 감도 30mA, 결선 확인창과 시험 버튼을 전면에 배치했습니다.",
    category: "elcb",
    price: 42000,
    leadTime: "재고 1~3일",
    stock: "in-stock",
    specs: [
      { label: "극수", value: "4P" },
      { label: "정격전류", value: "40A" },
      { label: "감도", value: "30mA" },
      { label: "적용", value: "삼상 부하" },
    ],
  },
  {
    slug: "nei-mc-18",
    sku: "NE1-MC-18",
    name: "전자접촉기 18A",
    summary: "AC3 7.5kW(380V)급 전자접촉기. 코일 AC 220V.",
    description:
      "7.5kW 모터 기동용 전자접촉기입니다. 주접점 3극, 보조접점 1NO+1NC, 코일 AC 220V.",
    category: "contactor",
    price: 32000,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "정격", value: "18A / AC3 7.5kW" },
      { label: "코일", value: "AC 220V" },
      { label: "보조접점", value: "1NO + 1NC" },
    ],
  },
  {
    slug: "nei-mc-32",
    sku: "NE1-MC-32",
    name: "전자접촉기 32A",
    summary: "AC3 15kW(380V)급 전자접촉기. 코일 AC 220V.",
    description:
      "15kW 모터 기동용 전자접촉기입니다. 주접점 3극, 보조접점 1NO+1NC.",
    category: "contactor",
    price: 54000,
    leadTime: "재고 1~3일",
    stock: "in-stock",
    specs: [
      { label: "정격", value: "32A / AC3 15kW" },
      { label: "코일", value: "AC 220V" },
      { label: "보조접점", value: "1NO + 1NC" },
    ],
  },
  {
    slug: "nei-smps-2410",
    sku: "NE1-SMPS-2410",
    name: "스위칭전원 24V 10A",
    summary: "제어반 내부 DC 24V 공급용 DIN 레일 SMPS.",
    description:
      "PLC, 센서, 릴레이 코일에 쓰는 DIN 레일형 24V 10A 스위칭전원입니다. 입력 AC 85~264V, 과전류·과전압 보호.",
    category: "power",
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
    slug: "nei-smps-245",
    sku: "NE1-SMPS-245",
    name: "스위칭전원 24V 5A",
    summary: "소형 함체용 24V 5A SMPS.",
    description:
      "소형 제어함, 센서 박스에 쓰는 24V 5A 스위칭전원입니다. DIN 레일 취부, 슬림 폭.",
    category: "power",
    price: 31000,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    specs: [
      { label: "출력", value: "DC 24V 5A" },
      { label: "입력", value: "AC 85~264V" },
      { label: "취부", value: "DIN 레일" },
    ],
  },
  {
    slug: "nei-tb-20",
    sku: "NE1-TB-20",
    name: "단자대 20P",
    summary: "제어배선용 20극 단자대. 10mm²까지.",
    description:
      "제어반 내부 단자대입니다. 20극, 전선 10mm²까지, 커버와 마킹 스트립 포함.",
    category: "terminal",
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
    slug: "nei-tb-10",
    sku: "NE1-TB-10",
    name: "단자대 10P",
    summary: "소용량 제어배선용 10극 단자대.",
    description: "센서·릴레이 분기용 10극 단자대입니다. 커버 포함, DIN 레일 취부.",
    category: "terminal",
    price: 7800,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "극수", value: "10P" },
      { label: "전선", value: "최대 6mm²" },
      { label: "취부", value: "DIN 레일" },
    ],
  },
  {
    slug: "nei-sp-24",
    sku: "NE1-SP-24",
    name: "서지보호기 24V",
    summary: "제어전원·신호선용 24V SPD. DIN 레일형.",
    description:
      "DC 24V 제어전원과 신호선을 낙뢰·서지로부터 보호하는 SPD입니다. 응답시간 1ns급, 상태 표시창.",
    category: "surge",
    price: 36000,
    leadTime: "재고 1~3일",
    stock: "limited",
    featured: true,
    specs: [
      { label: "정격", value: "DC 24V" },
      { label: "응답", value: "1ns급" },
      { label: "표시", value: "정상 / 수명 경고" },
      { label: "취부", value: "DIN 레일" },
    ],
  },
  {
    slug: "nei-ry-24",
    sku: "NE1-RY-24",
    name: "보조릴레이 DC 24V",
    summary: "제어반 신호 분기용 2C 보조릴레이. 소켓 포함.",
    description:
      "DC 24V 코일, 2C 접점 보조릴레이입니다. 소켓과 함께 출고되며 DIN 레일에 바로 취부합니다.",
    category: "relay",
    price: 9800,
    leadTime: "재고 당일~1일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "코일", value: "DC 24V" },
      { label: "접점", value: "2C" },
      { label: "구성", value: "릴레이 + 소켓" },
      { label: "취부", value: "DIN 레일" },
    ],
  },
  {
    slug: "nei-fuse-10",
    sku: "NE1-FUSE-10",
    name: "퓨즈홀더 10A",
    summary: "DIN 레일형 10A 퓨즈홀더. 표시창 포함.",
    description:
      "제어회로 보호용 10A 퓨즈홀더입니다. 단선 표시창, DIN 레일 취부. 퓨즈는 별도입니다.",
    category: "fuse",
    price: 4500,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "정격", value: "10A" },
      { label: "표시", value: "단선 표시창" },
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
