import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import {
  calculateDDay, calculateDateDiff, calculateDateOffset,
  formatDateKo, toDateStr, todayStr, parseLocalDate,
} from './calc'
import type { DateUnit, DateOperation } from './calc'

type Tab = 'dday' | 'diff' | 'calc'

// ── 날짜 유틸 ──────────────────────────────────────────────────
function shiftDays(base: string, n: number): string {
  const d = parseLocalDate(base); d.setDate(d.getDate() + n); return toDateStr(d)
}
function shiftMonths(base: string, n: number): string {
  const d = parseLocalDate(base); d.setMonth(d.getMonth() + n); return toDateStr(d)
}

// ── 스타일 상수 ────────────────────────────────────────────────
const CARD = {
  backgroundColor: 'var(--surface-card)',
  borderRadius: 'var(--radius-card)',
  padding: '16px',
} as const

const INPUT_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--surface-input)',
  color: 'var(--on-dark)',
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--radius-input)',
  fontSize: 14,
  width: '100%',
  padding: '8px 12px',
  outline: 'none',
  fontFamily: 'var(--font-number)',
}

const LABEL_STYLE: React.CSSProperties = {
  color: 'var(--on-dark-mute)',
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  display: 'block',
}

const HINT = { color: 'var(--on-dark-mute)', fontSize: 12, lineHeight: 1.6 } as const

// ── 공용 컴포넌트 ──────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1 transition-colors"
      style={{
        backgroundColor: active ? 'rgba(252,213,53,0.12)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--on-dark-mute)',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--hairline)'}`,
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function DateInput({ id, label, value, onChange }: {
  id: string; label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label htmlFor={id} style={LABEL_STYLE}>{label}</label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={INPUT_STYLE}
        onFocus={e => (e.target.style.borderColor = 'var(--info)')}
        onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
      />
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5"
      style={{
        color: copied ? 'var(--success)' : 'var(--on-dark-mute)',
        backgroundColor: 'var(--surface-input)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
      }}
    >
      {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
      {copied ? '복사됨' : '결과 복사'}
    </button>
  )
}

// ── D-day 탭 ──────────────────────────────────────────────────
function DDayTab() {
  const t = todayStr()
  const [target, setTarget] = useState('')

  const quickDates = [
    { label: '오늘',      value: t },
    { label: '내일',      value: shiftDays(t, 1) },
    { label: '1주일 후',  value: shiftDays(t, 7) },
    { label: '1개월 후',  value: shiftMonths(t, 1) },
    { label: '100일 후',  value: shiftDays(t, 100) },
  ]

  const result = calculateDDay(target)

  const resultColor = !result ? 'var(--on-dark)'
    : result.isToday ? 'var(--primary)'
    : result.isPast  ? 'var(--on-dark-mute)'
    : 'var(--success)'

  const weeksText = result && result.totalDays > 0
    ? result.weeks > 0
      ? `${result.weeks}주 ${result.remainingDays}일`
      : `${result.remainingDays}일`
    : null

  const copyText = result
    ? result.isToday
      ? `목표일이 오늘입니다. D-day`
      : result.isPast
        ? `목표일 (${formatDateKo(parseLocalDate(target))})로부터 ${result.totalDays}일이 지났습니다. (${result.label})`
        : `목표일 (${formatDateKo(parseLocalDate(target))})까지 ${result.totalDays}일 남았습니다. (${result.label})`
    : ''

  return (
    <div className="space-y-4">
      <div style={CARD}>
        <DateInput id="dday-target" label="목표일" value={target} onChange={setTarget} />
        <div className="flex flex-wrap gap-1.5 mt-3">
          {quickDates.map(q => (
            <Chip key={q.label} label={q.label} active={target === q.value} onClick={() => setTarget(q.value)} />
          ))}
        </div>
      </div>

      {!result && (
        <p className="text-center py-2 text-sm" style={{ color: 'var(--on-dark-mute)' }}>
          목표일을 선택하면 D-day를 계산해드릴게요.
        </p>
      )}

      {result && (
        <div style={CARD}>
          <div className="text-center mb-4">
            <p className="text-5xl font-bold mb-2" style={{ color: resultColor, fontFamily: 'var(--font-number)', letterSpacing: '-1px' }}>
              {result.label}
            </p>
            <p className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>
              {formatDateKo(parseLocalDate(target))}
            </p>
          </div>

          <div className="rounded-xl px-4 py-3 text-sm mb-3" style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', lineHeight: 1.7 }}>
            {result.isToday && '목표일이 오늘이에요.'}
            {result.isPast && (
              <>
                목표일로부터 <strong style={{ color: 'var(--on-dark)' }}>{result.totalDays}일</strong>이 지났어요.
                {weeksText && <><br />약 <strong style={{ color: 'var(--on-dark)' }}>{weeksText}</strong> 전이에요.</>}
              </>
            )}
            {!result.isToday && !result.isPast && (
              <>
                목표일까지 <strong style={{ color: 'var(--success)' }}>{result.totalDays}일</strong> 남았어요.
                {weeksText && <><br />약 <strong style={{ color: 'var(--success)' }}>{weeksText}</strong> 후에요.</>}
              </>
            )}
          </div>

          <div className="flex justify-end">
            <CopyButton text={copyText} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── 날짜 간격 탭 ──────────────────────────────────────────────
function DiffTab() {
  const [start, setStart] = useState('')
  const [end, setEnd]     = useState('')
  const [includeStart, setIncludeStart] = useState(false)

  const result = calculateDateDiff(start, end, includeStart)
  const weeksText = result
    ? result.weeks > 0
      ? `${result.weeks}주 ${result.remainingDays}일`
      : `${result.remainingDays}일`
    : null

  const copyText = result
    ? `${start} ~ ${end} 사이 날짜 차이: 총 ${result.totalDays}일`
    : ''

  return (
    <div className="space-y-4">
      <div style={CARD}>
        <div className="space-y-3">
          <DateInput id="diff-start" label="시작일" value={start} onChange={setStart} />
          <DateInput id="diff-end"   label="종료일" value={end}   onChange={setEnd} />
        </div>
        <button
          onClick={() => setIncludeStart(p => !p)}
          className="flex items-center gap-2 mt-3 text-xs"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--on-dark-mute)' }}
        >
          <span
            className="w-4 h-4 rounded flex items-center justify-center text-xs shrink-0"
            style={{
              backgroundColor: includeStart ? 'var(--primary)' : 'var(--surface-input)',
              border: `1px solid ${includeStart ? 'var(--primary)' : 'var(--hairline)'}`,
            }}
          >
            {includeStart && <span style={{ color: 'var(--on-primary)', fontSize: 10, lineHeight: 1 }}>✓</span>}
          </span>
          시작일 포함 (시작일을 1일로 계산)
        </button>
      </div>

      {!result && (
        <p className="text-center py-2 text-sm" style={{ color: 'var(--on-dark-mute)' }}>
          시작일과 종료일을 선택하면 간격을 계산해드릴게요.
        </p>
      )}

      {result && (
        <div style={CARD}>
          {result.isReversed && (
            <p className="text-xs mb-3 px-1" style={{ color: 'var(--on-dark-mute)' }}>
              종료일이 시작일보다 빠릅니다. 절댓값으로 계산했어요.
            </p>
          )}

          <div className="text-center mb-4">
            <p className="text-4xl font-bold mb-1" style={{ color: 'var(--primary)', fontFamily: 'var(--font-number)', letterSpacing: '-0.5px' }}>
              {result.totalDays.toLocaleString('ko-KR')}일
            </p>
          </div>

          <div className="rounded-xl px-4 py-3 text-sm mb-3" style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', lineHeight: 1.7 }}>
            총 <strong style={{ color: 'var(--on-dark)' }}>{result.totalDays.toLocaleString('ko-KR')}일</strong>이에요.
            {weeksText && <><br />약 <strong style={{ color: 'var(--on-dark)' }}>{weeksText}</strong>이에요.</>}
            {result.approxMonths >= 1 && (
              <><br />달력 기준으로 약 <strong style={{ color: 'var(--on-dark)' }}>{result.approxMonths.toFixed(1)}개월</strong>이에요.</>
            )}
          </div>

          <div className="flex justify-end">
            <CopyButton text={copyText} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── 날짜 계산 탭 ──────────────────────────────────────────────
const UNIT_OPTIONS: { value: DateUnit; label: string }[] = [
  { value: 'days',   label: '일' },
  { value: 'weeks',  label: '주' },
  { value: 'months', label: '개월' },
  { value: 'years',  label: '년' },
]

const QUICK_CHIPS: { label: string; value: number; unit: DateUnit }[] = [
  { label: '7일',   value: 7,  unit: 'days' },
  { label: '14일',  value: 14, unit: 'days' },
  { label: '30일',  value: 30, unit: 'days' },
  { label: '50일',  value: 50, unit: 'days' },
  { label: '100일', value: 100, unit: 'days' },
  { label: '1개월', value: 1,  unit: 'months' },
  { label: '3개월', value: 3,  unit: 'months' },
  { label: '6개월', value: 6,  unit: 'months' },
  { label: '1년',   value: 1,  unit: 'years' },
]

function CalcTab() {
  const [base, setBase]   = useState(todayStr())
  const [value, setValue] = useState('')
  const [unit, setUnit]   = useState<DateUnit>('days')
  const [op, setOp]       = useState<DateOperation>('add')

  const numVal = parseInt(value, 10)
  const result = calculateDateOffset(base, isNaN(numVal) ? 0 : numVal, unit, op)

  function applyQuick(chip: typeof QUICK_CHIPS[number]) {
    setValue(String(chip.value))
    setUnit(chip.unit)
  }

  return (
    <div className="space-y-4">
      <div style={CARD}>
        <div className="space-y-3">
          <DateInput id="calc-base" label="기준일" value={base} onChange={setBase} />

          {/* 더하기/빼기 토글 */}
          <div>
            <span style={LABEL_STYLE}>계산 방향</span>
            <div className="flex gap-2">
              {(['add', 'subtract'] as DateOperation[]).map(o => (
                <button
                  key={o}
                  onClick={() => setOp(o)}
                  className="flex-1 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: op === o ? 'var(--primary)' : 'var(--surface-input)',
                    color: op === o ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                    border: `1px solid ${op === o ? 'var(--primary)' : 'var(--hairline)'}`,
                    borderRadius: 'var(--radius-input)',
                    cursor: 'pointer',
                  }}
                >
                  {o === 'add' ? '+ 더하기' : '- 빼기'}
                </button>
              ))}
            </div>
          </div>

          {/* 숫자 + 단위 */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor="calc-value" style={LABEL_STYLE}>숫자</label>
              <input
                id="calc-value"
                type="text"
                inputMode="numeric"
                value={value}
                onChange={e => setValue(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                style={{ ...INPUT_STYLE, textAlign: 'right' }}
                onFocus={e => (e.target.style.borderColor = 'var(--info)')}
                onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
              />
            </div>
            <div>
              <span style={LABEL_STYLE}>단위</span>
              <div className="flex gap-1">
                {UNIT_OPTIONS.map(u => (
                  <button
                    key={u.value}
                    onClick={() => setUnit(u.value)}
                    className="px-2.5 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: unit === u.value ? 'var(--primary)' : 'var(--surface-input)',
                      color: unit === u.value ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                      border: `1px solid ${unit === u.value ? 'var(--primary)' : 'var(--hairline)'}`,
                      borderRadius: 'var(--radius-input)',
                      cursor: 'pointer',
                    }}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 빠른 입력 칩 */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CHIPS.map(chip => (
              <Chip
                key={chip.label}
                label={chip.label}
                active={value === String(chip.value) && unit === chip.unit}
                onClick={() => applyQuick(chip)}
              />
            ))}
          </div>
        </div>
      </div>

      {!result && (
        <p className="text-center py-2 text-sm" style={{ color: 'var(--on-dark-mute)' }}>
          기준일과 숫자를 입력하면 날짜를 계산해드릴게요.
        </p>
      )}

      {result && (
        <div style={CARD}>
          <p className="font-bold text-xl mb-2" style={{ color: 'var(--primary)', letterSpacing: '-0.3px' }}>
            {result.resultStr}
          </p>

          <div className="rounded-xl px-4 py-3 text-sm mb-3" style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', lineHeight: 1.7 }}>
            {result.sentence}
          </div>

          <div className="flex justify-end">
            <CopyButton text={result.sentence} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────
const TABS: { key: Tab; label: string }[] = [
  { key: 'dday', label: 'D-day' },
  { key: 'diff', label: '날짜 간격' },
  { key: 'calc', label: '날짜 계산' },
]

export function DateCalculatorTool() {
  const [tab, setTab] = useState<Tab>('dday')

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
            Daily Utility
          </p>
          <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
            날짜 계산기
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--on-dark-mute)' }}>
            D-day, 날짜 간격, 날짜 계산을 한번에
          </p>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--surface-input)' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 text-sm font-medium transition-colors rounded-lg"
              style={{
                backgroundColor: tab === t.key ? 'var(--surface-card)' : 'transparent',
                color: tab === t.key ? 'var(--on-dark)' : 'var(--on-dark-mute)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {tab === 'dday' && <DDayTab />}
        {tab === 'diff' && <DiffTab />}
        {tab === 'calc' && <CalcTab />}

      </div>
    </div>
  )
}
