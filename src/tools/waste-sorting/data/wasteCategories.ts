import type { WasteCategory } from '../types'

export const WASTE_CATEGORIES: WasteCategory[] = [
  { id: 'fruit-vegetable', label: '과일·채소',        emoji: '🥦' },
  { id: 'meat-fish',       label: '육류·생선',        emoji: '🍖' },
  { id: 'shellfish',       label: '조개·갑각류',      emoji: '🦐' },
  { id: 'egg-nut',         label: '알·견과류',        emoji: '🥚' },
  { id: 'oil-grease',      label: '기름·유류',        emoji: '🛢️' },
  { id: 'coffee-tea',      label: '커피·차·한약재',   emoji: '☕' },
  { id: 'sauce-paste',     label: '양념·장류',        emoji: '🫙' },
  { id: 'leftover',        label: '남은 음식',        emoji: '🍚' },
  { id: 'other',           label: '기타 헷갈리는 항목', emoji: '🤔' },
]

export const POPULAR_ITEM_IDS = [
  'chicken-bone',
  'eggshell',
  'clam-shell',
  'peach-seed',
  'onion-peel',
  'garlic-peel',
  'green-onion-root',
  'waste-cooking-oil',
  'grilling-oil',
  'coffee-grounds',
  'tea-bag',
  'fish-bone',
  'crab-shell',
  'shrimp-shell',
  'pineapple-peel',
  'watermelon-rind',
]
