export type StainId =
  | 'coffee' | 'kimchi' | 'oil' | 'blood' | 'ink'
  | 'makeup' | 'sweat' | 'chocolate' | 'soy-sauce' | 'wine'
  | 'mud' | 'gum' | 'mold' | 'juice' | 'soup'

export type StainCondition = 'fresh' | 'delayed' | 'dried' | 'post-wash'
export type FabricType = 'general' | 'white' | 'colored' | 'knit' | 'silk' | 'denim' | 'sportswear'
export type Difficulty = 'easy' | 'normal' | 'hard'

export interface StainGuide {
  id: StainId
  name: string
  emoji: string
  difficulty: Difficulty
  summary: string
  doNot: string[]
  materials: string[]
  steps: string[]
  caution: string
}

export interface ConditionModifier {
  id: StainCondition
  label: string
  note: string
  prefixStep?: string
  makesHarder?: boolean
  suggestProfessional?: boolean
}

export interface FabricModifier {
  id: FabricType
  label: string
  warning?: string
  additionalDont?: string[]
  additionalMaterials?: string[]
  professionalRecommended?: boolean
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
}

// ── 얼룩 가이드 15개 ──────────────────────────────────────────

export const STAIN_GUIDES: StainGuide[] = [
  {
    id: 'coffee',
    name: '커피',
    emoji: '☕',
    difficulty: 'easy',
    summary: '찬물로 뒷면에서 헹구고, 중성세제로 전처리 후 세탁하세요.',
    doNot: [
      '뜨거운 물 사용 — 단백질 고착 우려',
      '앞면에서 강하게 문지르기 — 얼룩이 더 번짐',
      '전처리 없이 바로 세탁기 투입',
    ],
    materials: ['찬물', '중성세제 (주방세제 가능)', '깨끗한 타월'],
    steps: [
      '옷의 뒷면(안쪽)에서 찬물로 얼룩을 헹궈요.',
      '중성세제를 얼룩에 소량 직접 묻혀요.',
      '5~10분간 방치해요.',
      '손가락으로 두드리거나 살살 눌러 세제가 스며들게 해요.',
      '찬물로 헹군 후 평소대로 세탁해요.',
    ],
    caution: '컬러 의류는 세제를 먼저 눈에 안 띄는 부분에 테스트하세요.',
  },
  {
    id: 'kimchi',
    name: '김치국물',
    emoji: '🌶️',
    difficulty: 'normal',
    summary: '찬물로 즉시 헹구고, 주방세제 전처리 후 산소계 표백제로 마무리하세요.',
    doNot: [
      '뜨거운 물 사용 — 색소가 섬유에 고착됨',
      '세게 문지르기 — 얼룩이 더 넓게 번짐',
      '표백제를 컬러 의류에 바로 사용',
    ],
    materials: ['찬물', '주방세제', '산소계 표백제', '깨끗한 타월'],
    steps: [
      '찬물로 즉시 헹궈요.',
      '주방세제를 얼룩에 직접 묻히고 부드럽게 두드려요.',
      '10분간 방치해요.',
      '찬물로 헹궈요.',
      '색이 남아 있으면 산소계 표백제를 적용하고 30분 방치 후 세탁해요.',
    ],
    caution: '흰 옷에는 산소계 표백제를 사용할 수 있어요. 유색 의류는 테스트 필수.',
  },
  {
    id: 'oil',
    name: '기름 / 음식기름',
    emoji: '🍳',
    difficulty: 'normal',
    summary: '마른 상태에서 기름을 흡수시키고, 주방세제로 유분을 제거하세요.',
    doNot: [
      '물부터 사용 — 기름이 번짐',
      '젖은 상태로 문지르기',
      '건조기 사용 — 열이 기름 얼룩을 영구 고착시킴',
    ],
    materials: ['소금 또는 베이킹소다', '주방세제', '따뜻한 물', '깨끗한 타월'],
    steps: [
      '마른 상태에서 소금이나 베이킹소다를 얼룩 위에 두텁게 뿌려요.',
      '1~2분 기다렸다가 털어내요.',
      '주방세제를 얼룩에 직접 묻히고 부드럽게 문질러요.',
      '따뜻한 물로 헹궈요.',
      '기름이 완전히 제거됐는지 확인 후 세탁해요.',
    ],
    caution: '기름이 남은 채로 건조기를 사용하면 얼룩이 영구적으로 굳을 수 있어요.',
  },
  {
    id: 'blood',
    name: '혈액',
    emoji: '🩸',
    difficulty: 'normal',
    summary: '반드시 찬물만 사용하세요. 소금물이나 과산화수소로 처리하면 효과적이에요.',
    doNot: [
      '뜨거운 물 사용 — 단백질이 고착됨',
      '세게 문지르기',
      '표백제 바로 사용 — 섬유 손상 가능',
    ],
    materials: ['찬물', '소금', '과산화수소 3% (약국 구입)', '깨끗한 천'],
    steps: [
      '찬물로 즉시 헹궈요.',
      '소금을 얼룩에 뿌리고 찬물을 조금 적셔요.',
      '10분 방치 후 찬물로 헹궈요.',
      '얼룩이 남으면 과산화수소를 소량 적용해요.',
      '기포가 멈추면 찬물로 헹궈요.',
      '찬물로 세탁해요.',
    ],
    caution: '과산화수소는 흰 옷에만 사용하세요. 컬러 의류는 탈색될 수 있어요.',
  },
  {
    id: 'ink',
    name: '볼펜 잉크',
    emoji: '🖊️',
    difficulty: 'hard',
    summary: '알코올(소독용 알코올 또는 손 소독제)로 두드려 잉크를 아래 천으로 이동시켜요.',
    doNot: [
      '물로 먼저 헹굼 — 잉크가 더 번짐',
      '세게 문지르기 — 얼룩 확산',
      '열로 건조 — 잉크 고착',
    ],
    materials: ['소독용 알코올 또는 손 소독제', '깨끗한 천 2장', '중성세제'],
    steps: [
      '얼룩 아래에 깨끗한 천을 받쳐요.',
      '소독용 알코올을 얼룩에 소량 적셔요.',
      '위에서 깨끗한 천으로 두드리듯 눌러서 잉크가 받침 천으로 이동하게 해요.',
      '천을 조금씩 옮겨가며 반복해요.',
      '중성세제로 처리 후 헹궈요.',
      '세탁해요.',
    ],
    caution: '수성 잉크는 물로 처리 가능하지만, 유성 볼펜은 알코올이 필수예요. 굳은 잉크는 드라이클리닝을 권장해요.',
  },
  {
    id: 'makeup',
    name: '메이크업',
    emoji: '💄',
    difficulty: 'normal',
    summary: '파운데이션·립스틱 등 유성 메이크업은 클렌징오일로, 마스카라는 알코올로 처리해요.',
    doNot: [
      '물로 먼저 문지르기 — 번짐 주의',
      '색조 제품을 세게 문지르기',
      '뜨거운 물 사용',
    ],
    materials: ['클렌징오일 또는 메이크업 리무버', '소독용 알코올 (마스카라용)', '주방세제', '찬물'],
    steps: [
      '파운데이션·립스틱: 클렌징오일을 얼룩에 직접 적용해요.',
      '부드럽게 두드려 기름기를 분리해요.',
      '주방세제로 기름 성분을 제거해요.',
      '마스카라: 소독용 알코올로 두드리듯 처리해요.',
      '찬물로 헹군 후 세탁해요.',
    ],
    caution: '아이섀도우 등 파우더 계열은 먼저 털어낸 후 처리하세요. 문지르면 번집니다.',
  },
  {
    id: 'sweat',
    name: '땀 / 황변',
    emoji: '💧',
    difficulty: 'normal',
    summary: '산소계 표백제와 베이킹소다를 활용해요. 황변은 반복 처리가 필요할 수 있어요.',
    doNot: [
      '염소계 표백제 사용 — 섬유 손상, 실크·울 금지',
      '뜨거운 물에 바로 세탁',
      '데오도란트가 묻은 채 세탁',
    ],
    materials: ['산소계 표백제', '베이킹소다', '따뜻한 물', '레몬즙 (선택)'],
    steps: [
      '산소계 표백제와 따뜻한 물을 1:1로 섞어요.',
      '얼룩 부위에 직접 적용해요.',
      '30분~1시간 방치해요.',
      '베이킹소다를 추가로 뿌리고 부드럽게 문지를 수 있어요.',
      '찬물로 헹군 후 세탁해요.',
    ],
    caution: '황변이 심하면 여러 번 반복해야 해요. 실크·울 소재는 드라이클리닝을 권장해요.',
  },
  {
    id: 'chocolate',
    name: '초콜릿',
    emoji: '🍫',
    difficulty: 'easy',
    summary: '굳힌 후 긁어내고, 찬물과 세제로 처리해요.',
    doNot: [
      '뜨거운 물 사용 — 초콜릿이 녹아 섬유에 스며듦',
      '액체 상태에서 문지르기',
      '따뜻한 물로 바로 헹굼',
    ],
    materials: ['아이스팩 또는 얼음', '버터나이프 또는 숟가락', '찬물', '중성세제'],
    steps: [
      '초콜릿이 액체 상태라면 아이스팩으로 굳혀요.',
      '버터나이프로 조심스럽게 긁어내요.',
      '찬물로 뒷면에서 헹궈요.',
      '중성세제를 얼룩에 직접 적용해요.',
      '10분 방치 후 세탁해요.',
    ],
    caution: '밀크초콜릿은 단백질 성분이 있어 뜨거운 물에 고착될 수 있어요.',
  },
  {
    id: 'soy-sauce',
    name: '간장 / 소스',
    emoji: '🫙',
    difficulty: 'easy',
    summary: '찬물로 즉시 헹구고, 중성세제로 전처리 후 세탁하세요.',
    doNot: [
      '뜨거운 물 사용 — 색소가 고착됨',
      '세게 문지르기',
      '시간을 오래 두기',
    ],
    materials: ['찬물', '중성세제', '산소계 표백제 (잔여 색상용)'],
    steps: [
      '찬물로 즉시 헹궈요.',
      '중성세제를 직접 적용하고 10분 방치해요.',
      '찬물로 헹궈요.',
      '색상이 남으면 산소계 표백제를 처리해요.',
      '세탁해요.',
    ],
    caution: '굳은 간장 얼룩은 제거가 어려워요. 드라이클리닝을 고려하세요.',
  },
  {
    id: 'wine',
    name: '와인',
    emoji: '🍷',
    difficulty: 'normal',
    summary: '소금으로 즉시 흡수시키고, 탄산수와 산소계 표백제로 처리해요.',
    doNot: [
      '소금 없이 바로 물 붓기',
      '뜨거운 물 사용',
      '세게 문지르기 — 섬유에 깊이 박힘',
    ],
    materials: ['소금', '탄산수', '중성세제', '산소계 표백제'],
    steps: [
      '소금을 얼룩 위에 두텁게 뿌려 와인을 흡수시켜요.',
      '1~2분 후 털어내요.',
      '탄산수를 붓고 기포가 얼룩을 부상시키도록 기다려요.',
      '깨끗한 천으로 두드리듯 처리해요.',
      '중성세제를 적용하고 세탁해요.',
    ],
    caution: '레드 와인은 빠른 처리가 핵심이에요. 굳으면 제거가 매우 어려워요.',
  },
  {
    id: 'mud',
    name: '진흙',
    emoji: '🪨',
    difficulty: 'easy',
    summary: '완전히 건조한 후 털어내고 세탁하세요. 젖은 상태로 문지르면 더 번져요.',
    doNot: [
      '젖은 상태에서 문지르기 — 더 넓게 번짐',
      '바로 물에 적시기',
      '세게 솔질하기',
    ],
    materials: ['솔 또는 건조한 천', '찬물', '중성세제'],
    steps: [
      '진흙이 완전히 건조될 때까지 기다려요.',
      '마른 진흙을 솔이나 손으로 털어내요.',
      '찬물로 뒷면에서 헹궈요.',
      '중성세제를 적용하고 세탁해요.',
    ],
    caution: '흙이 묻은 채 문지르면 섬유 깊이 침투해요. 반드시 먼저 건조시키세요.',
  },
  {
    id: 'gum',
    name: '껌',
    emoji: '🧸',
    difficulty: 'normal',
    summary: '얼음으로 껌을 굳힌 후 긁어내고, 남은 접착 성분은 알코올로 제거해요.',
    doNot: [
      '손가락으로 잡아당기기 — 섬유 올 손상',
      '뜨거운 물로 처리 — 껌이 더 늘어남',
      '세게 솔질',
    ],
    materials: ['얼음 또는 아이스팩', '버터나이프 또는 숟가락', '소독용 알코올', '중성세제'],
    steps: [
      '얼음이나 아이스팩을 껌 위에 올려 완전히 굳혀요.',
      '버터나이프로 조심스럽게 긁어내요.',
      '남은 접착 성분에 소독용 알코올을 적용해요.',
      '깨끗한 천으로 두드리며 제거해요.',
      '중성세제로 처리 후 세탁해요.',
    ],
    caution: '섬유 올이 당겨질 수 있으므로 무리하게 긁지 마세요. 니트·울은 특히 주의하세요.',
  },
  {
    id: 'mold',
    name: '곰팡이',
    emoji: '🍄',
    difficulty: 'hard',
    summary: '산소계 표백제로 처리하고 햇볕에 건조하세요. 곰팡이 포자 흡입 주의.',
    doNot: [
      '마른 상태에서 실내에서 솔질 — 포자 흡입 위험',
      '물로만 헹굼',
      '그냥 세탁기에 투입 — 다른 옷에 전염 가능성',
    ],
    materials: ['마스크', '산소계 표백제', '따뜻한 물', '솔'],
    steps: [
      '마스크를 착용하고 야외에서 마른 곰팡이를 살살 털어내요.',
      '산소계 표백제를 따뜻한 물에 희석해요.',
      '얼룩 부위를 충분히 적시고 30분 방치해요.',
      '세탁해요.',
      '햇볕이 잘 드는 곳에서 건조해요.',
    ],
    caution: '곰팡이가 넓게 퍼졌다면 드라이클리닝이나 폐기를 고려하세요. 포자를 들이마시지 않도록 주의하세요.',
  },
  {
    id: 'juice',
    name: '과일 주스',
    emoji: '🧃',
    difficulty: 'easy',
    summary: '찬물로 즉시 뒷면에서 헹구고, 산소계 표백제로 색소를 제거해요.',
    doNot: [
      '뜨거운 물 사용 — 색소 고착',
      '세게 문지르기',
      '시간을 두기',
    ],
    materials: ['찬물', '중성세제', '산소계 표백제'],
    steps: [
      '찬물로 뒷면에서 즉시 헹궈요.',
      '중성세제를 직접 적용하고 5분 방치해요.',
      '찬물로 헹궈요.',
      '색이 남으면 산소계 표백제를 적용하고 30분 방치 후 세탁해요.',
    ],
    caution: '블루베리·체리 등 진한 주스는 산소계 표백제 처리가 필수예요.',
  },
  {
    id: 'soup',
    name: '음식 국물',
    emoji: '🍲',
    difficulty: 'easy',
    summary: '찬물로 즉시 헹구고, 주방세제로 전처리 후 세탁하세요.',
    doNot: [
      '뜨거운 물 사용',
      '세게 문지르기',
      '시간을 두기',
    ],
    materials: ['찬물', '주방세제 또는 중성세제'],
    steps: [
      '찬물로 즉시 헹궈요.',
      '주방세제를 직접 적용하고 10분 방치해요.',
      '찬물로 헹궈요.',
      '세탁해요.',
    ],
    caution: '국물에 기름이 많다면 기름 얼룩 처리 방법을 함께 참고하세요.',
  },
]

// ── 상태 modifier 4개 ──────────────────────────────────────────

export const CONDITION_MODIFIERS: ConditionModifier[] = [
  {
    id: 'fresh',
    label: '방금 묻었어요',
    note: '방금 묻은 얼룩은 빠르게 처리할수록 쉽게 제거돼요.',
  },
  {
    id: 'delayed',
    label: '시간이 좀 지났어요',
    note: '아직 처리 가능해요. 전처리 시간을 두 배로 늘려주세요.',
    prefixStep: '전처리 시간을 기본보다 두 배 길게 잡아요 (예: 10분 → 20분).',
    makesHarder: true,
  },
  {
    id: 'dried',
    label: '완전히 굳었어요',
    note: '굳은 얼룩은 먼저 불려야 해요. 찬물에 30분 이상 담근 후 처리하세요.',
    prefixStep: '찬물에 30분 이상 담가 얼룩을 불린 후 처리를 시작해요.',
    makesHarder: true,
  },
  {
    id: 'post-wash',
    label: '세탁 후에도 남아있어요',
    note: '건조기를 사용했다면 열로 고착됐을 수 있어요. 드라이클리닝을 고려해보세요.',
    prefixStep: '다시 찬물에 30분 불린 후 처리해요. 건조기는 절대 사용하지 마세요.',
    makesHarder: true,
    suggestProfessional: true,
  },
]

// ── 소재 modifier 7개 ──────────────────────────────────────────

export const FABRIC_MODIFIERS: FabricModifier[] = [
  {
    id: 'general',
    label: '일반 의류',
  },
  {
    id: 'white',
    label: '흰 옷',
    warning: '흰 옷에는 산소계 표백제를 적극 활용할 수 있어요. 염소계 표백제는 섬유를 손상시킬 수 있어요.',
    additionalMaterials: ['산소계 표백제 (흰 옷 전용 권장)'],
  },
  {
    id: 'colored',
    label: '컬러 / 유색 의류',
    warning: '표백제 사용 전 반드시 눈에 안 띄는 부분에서 탈색 여부를 테스트하세요.',
    additionalDont: ['표백제를 바로 전체 적용하기'],
  },
  {
    id: 'knit',
    label: '니트 / 울',
    warning: '니트·울은 물과 마찰에 약해요. 두드리는 처리만 하고, 비비거나 세탁기 사용을 피하세요.',
    additionalDont: ['세탁기 사용', '세게 문지르기', '뜨거운 물'],
    professionalRecommended: true,
  },
  {
    id: 'silk',
    label: '실크 / 섬세한 소재',
    warning: '실크·섬세한 소재는 집에서 처리 시 손상 위험이 높아요. 드라이클리닝을 강력 권장해요.',
    additionalDont: ['세탁기 사용', '표백제', '세게 문지르기', '뜨거운 물'],
    professionalRecommended: true,
  },
  {
    id: 'denim',
    label: '데님',
    warning: '데님은 인디고 염색이라 표백제에 탈색될 수 있어요. 처리 전 안쪽에서 테스트하세요.',
    additionalDont: ['표백제 (인디고 탈색 위험)'],
  },
  {
    id: 'sportswear',
    label: '스포츠웨어 / 기능성',
    warning: '기능성 소재는 강한 세제·표백제·섬유유연제로 기능이 손상될 수 있어요. 전용 세제를 사용하세요.',
    additionalDont: ['표백제', '섬유유연제 (발수 기능 저하)'],
  },
]

// ── 헬퍼 ─────────────────────────────────────────────────────

export function getStainById(id: StainId): StainGuide | undefined {
  return STAIN_GUIDES.find(s => s.id === id)
}

export function getConditionById(id: StainCondition): ConditionModifier | undefined {
  return CONDITION_MODIFIERS.find(c => c.id === id)
}

export function getFabricById(id: FabricType): FabricModifier | undefined {
  return FABRIC_MODIFIERS.find(f => f.id === id)
}

export function composeDifficulty(base: Difficulty, condition: ConditionModifier): Difficulty {
  if (!condition.makesHarder) return base
  if (base === 'easy') return 'normal'
  if (base === 'normal') return 'hard'
  return 'hard'
}
