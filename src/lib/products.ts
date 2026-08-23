export type ProductCategory =
  | "ic"
  | "discrete"
  | "sensor"
  | "passive"
  | "mcu"
  | "led"
  | "lcd"
  | "power"
  | "battery"
  | "connector"
  | "terminal"
  | "pcb"
  | "switch"
  | "breaker"
  | "elcb"
  | "fuse"
  | "surge"
  | "contactor"
  | "relay"
  | "motor"
  | "cable"
  | "tool"
  | "meter";

export type CategoryGroupId =
  | "semicon"
  | "sensor"
  | "passive"
  | "board"
  | "display"
  | "power"
  | "connect"
  | "electric"
  | "control"
  | "cable"
  | "tool";

export const categoryGroups: {
  id: CategoryGroupId;
  label: string;
  description: string;
  children: ProductCategory[];
}[] = [
  { id: "semicon", label: "반도체/전자부품", description: "IC · 트랜지스터 · 다이오드", children: ["ic", "discrete"] },
  { id: "sensor", label: "센서", description: "온습도 · 근접 · 감지", children: ["sensor"] },
  { id: "passive", label: "RLC/수동소자", description: "저항 · 콘덴서 · 인덕터", children: ["passive"] },
  { id: "board", label: "MCU/개발보드", description: "개발보드 · 모듈", children: ["mcu"] },
  { id: "display", label: "LED/LCD", description: "표시등 · 문자 LCD", children: ["led", "lcd"] },
  { id: "power", label: "전원/파워/배터리", description: "SMPS · 배터리", children: ["power", "battery"] },
  { id: "connect", label: "커넥터/단자/PCB", description: "커넥터 · 단자대 · 기판", children: ["connector", "terminal", "pcb"] },
  { id: "electric", label: "스위치/전기부품", description: "스위치 · 차단기 · 퓨즈 · SPD", children: ["switch", "breaker", "elcb", "fuse", "surge"] },
  { id: "control", label: "제어/모터/릴레이", description: "접촉기 · 릴레이 · 모터", children: ["contactor", "relay", "motor"] },
  { id: "cable", label: "케이블/전선", description: "전선 · 점퍼 · 하네스", children: ["cable"] },
  { id: "tool", label: "공구/계측", description: "납땜 · 멀티미터", children: ["tool", "meter"] },
];

export const categories: {
  id: ProductCategory | "all";
  label: string;
  description: string;
}[] = [
  { id: "all", label: "전체", description: "엔이원텍 전자부품 전체" },
  { id: "ic", label: "IC", description: "레귤레이터 · 로직 IC" },
  { id: "discrete", label: "디스크리트", description: "트랜지스터 · 다이오드" },
  { id: "sensor", label: "센서", description: "온습도 · 근접 · 인체감지" },
  { id: "passive", label: "수동소자", description: "저항 · 콘덴서" },
  { id: "mcu", label: "MCU/개발보드", description: "개발보드 · 모듈" },
  { id: "led", label: "LED", description: "표시 LED" },
  { id: "lcd", label: "LCD", description: "문자 · 그래픽 표시" },
  { id: "power", label: "스위칭전원", description: "SMPS · 제어전원" },
  { id: "battery", label: "배터리", description: "셀 · 홀더" },
  { id: "connector", label: "커넥터", description: "XH · 핀헤더" },
  { id: "terminal", label: "단자대", description: "제어배선 · DIN 레일" },
  { id: "pcb", label: "PCB/기판", description: "만능기판 · 프로토" },
  { id: "switch", label: "스위치", description: "택트 · 토글" },
  { id: "breaker", label: "배선용차단기", description: "MCCB · 주차단기" },
  { id: "elcb", label: "누전차단기", description: "ELCB · 감전 보호" },
  { id: "fuse", label: "퓨즈·홀더", description: "회로 보호 퓨즈" },
  { id: "surge", label: "서지보호기", description: "SPD · 낙뢰 보호" },
  { id: "contactor", label: "전자접촉기", description: "모터 기동 · 부하 개폐" },
  { id: "relay", label: "보조릴레이", description: "제어 접점 · 신호 분기" },
  { id: "motor", label: "모터", description: "DC · 기어드" },
  { id: "cable", label: "케이블/전선", description: "점퍼 · 전선" },
  { id: "tool", label: "전자공구", description: "납땜 · 인두" },
  { id: "meter", label: "계측기", description: "멀티미터 · 테스터" },
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
  {
    slug: "nei-ic-7805",
    sku: "NE1-IC-7805",
    name: "리니어 레귤레이터 7805",
    summary: "5V 1A 3단자 레귤레이터. TO-220.",
    description: "DC 입력에서 5V를 만드는 7805 레귤레이터입니다. 개발보드, 센서 모듈 전원에 씁니다.",
    category: "ic",
    price: 400,
    leadTime: "재고 당일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "출력", value: "5V 1A" },
      { label: "패키지", value: "TO-220" },
      { label: "입력", value: "7~25V" },
    ],
  },
  {
    slug: "nei-tr-2n2222",
    sku: "NE1-TR-2N2222",
    name: "트랜지스터 2N2222",
    summary: "NPN 스위칭 트랜지스터. TO-92.",
    description: "소신호 스위칭용 NPN 트랜지스터입니다. 릴레이 구동, LED 드라이브에 사용합니다.",
    category: "discrete",
    price: 150,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "극성", value: "NPN" },
      { label: "패키지", value: "TO-92" },
      { label: "Ic", value: "800mA" },
    ],
  },
  {
    slug: "nei-sns-dht22",
    sku: "NE1-SNS-DHT22",
    name: "온습도센서 DHT22",
    summary: "디지털 온습도 모듈. 3.3~5V.",
    description: "온도와 습도를 디지털로 읽는 모듈입니다. 제어반 온습도 감시, 시제작용.",
    category: "sensor",
    price: 6500,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "측정", value: "온도 · 습도" },
      { label: "전원", value: "3.3~5V" },
      { label: "출력", value: "디지털" },
    ],
  },
  {
    slug: "nei-r-103",
    sku: "NE1-R-103",
    name: "탄소피막저항 10kΩ 100개",
    summary: "1/4W 5% 저항 묶음. 10kΩ.",
    description: "시제품·수리용 10kΩ 1/4W 저항 100개 묶음입니다.",
    category: "passive",
    price: 1800,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "저항", value: "10kΩ" },
      { label: "전력", value: "1/4W" },
      { label: "허용차", value: "±5%" },
      { label: "포장", value: "100개" },
    ],
  },
  {
    slug: "nei-mcu-uno",
    sku: "NE1-MCU-UNO",
    name: "MCU 개발보드 UNO",
    summary: "ATmega328P 호환 개발보드. USB.",
    description: "센서·릴레이 시험용 UNO 호환 개발보드입니다. USB로 전원·통신합니다.",
    category: "mcu",
    price: 12500,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    featured: true,
    specs: [
      { label: "MCU", value: "ATmega328P 호환" },
      { label: "전압", value: "5V" },
      { label: "인터페이스", value: "USB" },
    ],
  },
  {
    slug: "nei-led-5r",
    sku: "NE1-LED-5R",
    name: "5mm LED 적색 20개",
    summary: "표시용 5mm 적색 LED 묶음.",
    description: "패널 표시, 기판 상태등용 5mm 적색 LED 20개입니다.",
    category: "led",
    price: 1200,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "색", value: "적색" },
      { label: "크기", value: "5mm" },
      { label: "Vf", value: "2.0V" },
    ],
  },
  {
    slug: "nei-lcd-1602",
    sku: "NE1-LCD-1602",
    name: "캐릭터 LCD 1602",
    summary: "16×2 문자 LCD. 5V, 백라이트.",
    description: "상태 표시용 16자 2줄 문자 LCD입니다. 5V, 백라이트 포함.",
    category: "lcd",
    price: 4200,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    specs: [
      { label: "표시", value: "16×2" },
      { label: "전원", value: "5V" },
      { label: "백라이트", value: "있음" },
    ],
  },
  {
    slug: "nei-bat-18650h",
    sku: "NE1-BAT-18650H",
    name: "18650 배터리 홀더 1셀",
    summary: "18650 1셀 홀더. 리드선.",
    description: "원통형 18650 1셀용 홀더입니다. 리드선 출하, 시제품 전원에 씁니다. 전지는 별도입니다.",
    category: "battery",
    price: 900,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "셀", value: "18650 1셀" },
      { label: "출력", value: "리드선" },
      { label: "전지", value: "별도" },
    ],
  },
  {
    slug: "nei-cn-xh4",
    sku: "NE1-CN-XH4",
    name: "XH 4P 커넥터 세트",
    summary: "2.5mm 피치 XH 4극 하우징+핀.",
    description: "전원·신호 분기용 XH 4P 하우징과 압착 핀 세트입니다.",
    category: "connector",
    price: 600,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "극수", value: "4P" },
      { label: "피치", value: "2.5mm" },
      { label: "형식", value: "XH" },
    ],
  },
  {
    slug: "nei-pcb-dot",
    sku: "NE1-PCB-DOT",
    name: "만능기판 5×7cm",
    summary: "양면 스루홀 만능기판.",
    description: "시제품 배선용 5×7cm 양면 만능기판입니다.",
    category: "pcb",
    price: 700,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "크기", value: "5×7cm" },
      { label: "면", value: "양면" },
      { label: "홀", value: "스루홀" },
    ],
  },
  {
    slug: "nei-sw-tact",
    sku: "NE1-SW-TACT",
    name: "택트스위치 6×6 20개",
    summary: "기판용 택트스위치 묶음.",
    description: "조작 입력용 6×6mm 택트스위치 20개입니다.",
    category: "switch",
    price: 1500,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "크기", value: "6×6mm" },
      { label: "접점", value: "1회로" },
      { label: "포장", value: "20개" },
    ],
  },
  {
    slug: "nei-mtr-12v",
    sku: "NE1-MTR-12V",
    name: "DC 기어드모터 12V",
    summary: "감속 기어드모터. 축 직경 6mm.",
    description: "시험 지그, 소형 구동용 12V 기어드모터입니다.",
    category: "motor",
    price: 8900,
    leadTime: "재고 1~3일",
    stock: "in-stock",
    specs: [
      { label: "전압", value: "DC 12V" },
      { label: "축", value: "6mm" },
      { label: "형식", value: "기어드" },
    ],
  },
  {
    slug: "nei-cab-22",
    sku: "NE1-CAB-22",
    name: "점퍼전선 22AWG 10색",
    summary: "단선 점퍼 10색 세트. 각 2m.",
    description: "브레드보드·기판 점퍼용 22AWG 단선 10색 세트입니다.",
    category: "cable",
    price: 4500,
    leadTime: "재고 당일",
    stock: "in-stock",
    specs: [
      { label: "규격", value: "22AWG" },
      { label: "색", value: "10색" },
      { label: "길이", value: "각 2m" },
    ],
  },
  {
    slug: "nei-tls-sld",
    sku: "NE1-TLS-SLD",
    name: "납땜인두 60W",
    summary: "온도조절 납땜인두. 팁 포함.",
    description: "현장 수리·시제품 납땜용 60W 인두입니다. 온도 조절, 기본 팁 포함.",
    category: "tool",
    price: 18900,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    specs: [
      { label: "전력", value: "60W" },
      { label: "온도", value: "조절식" },
      { label: "구성", value: "인두 + 팁" },
    ],
  },
  {
    slug: "nei-mtr-dmm",
    sku: "NE1-MTR-DMM",
    name: "디지털 멀티미터",
    summary: "전압·전류·저항 측정. 자동레인지.",
    description: "현장 점검용 디지털 멀티미터입니다. 전압, 전류, 저항, 도통 부저.",
    category: "meter",
    price: 24500,
    leadTime: "재고 1~2일",
    stock: "in-stock",
    specs: [
      { label: "측정", value: "V · A · Ω" },
      { label: "레인지", value: "자동" },
      { label: "부저", value: "도통" },
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

export function getCategoryGroup(id: ProductCategory) {
  return categoryGroups.find((group) => group.children.includes(id));
}

export function getGroupLabel(id: CategoryGroupId | "all") {
  if (id === "all") return "전체";
  return categoryGroups.find((group) => group.id === id)?.label ?? id;
}

export function categoriesInGroup(group: CategoryGroupId | "all") {
  if (group === "all") return categories.filter((item) => item.id !== "all");
  const children = categoryGroups.find((item) => item.id === group)?.children ?? [];
  return categories.filter((item) => item.id !== "all" && children.includes(item.id));
}

export function matchTaxonomy(
  category: ProductCategory,
  group: CategoryGroupId | "all" = "all",
  leaf: ProductCategory | "all" = "all",
) {
  if (leaf !== "all") return category === leaf;
  if (group === "all") return true;
  return categoryGroups.find((item) => item.id === group)?.children.includes(category) ?? false;
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
