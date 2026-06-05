import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import type { ExpenseItem as ExpenseItemType } from '../types'
import { formatKRW, parseAmount } from '../lib/calc'

interface Props {
  item: ExpenseItemType
  salary: number
  onUpdate: (item: ExpenseItemType) => void
  onDelete: (id: string) => void
}

export function ExpenseItem({ item, salary, onUpdate, onDelete }: Props) {
  const [amountRaw, setAmountRaw] = useState(item.amount > 0 ? formatKRW(item.amount) : '')
  const [touched, setTouched] = useState(false)

  // Sync display value when amount is updated externally (e.g. subscription import)
  useEffect(() => {
    setAmountRaw(item.amount > 0 ? formatKRW(item.amount) : '')
  }, [item.amount])

  const showNameError = touched && item.name.trim() === '' && item.amount > 0

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onUpdate({ ...item, name: e.target.value.slice(0, 30) })
  }

  function handleNameBlur() {
    setTouched(true)
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '')
    const parsed = parseAmount(input)
    setAmountRaw(parsed > 0 ? formatKRW(parsed) : input === '' ? '' : formatKRW(parsed))
    onUpdate({ ...item, amount: parsed })
  }

  function handleAmountBlur() {
    setAmountRaw(item.amount > 0 ? formatKRW(item.amount) : '')
  }

  const ratio = salary > 0 && item.amount > 0 ? (item.amount / salary) * 100 : 0
  const showRatioBar = salary > 0 && item.name.trim() !== ''

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-input)',
    color: 'var(--on-dark)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--radius-input)',
  }

  return (
    <div>
      <div className="flex gap-2 items-start">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            aria-label="항목명"
            value={item.name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            placeholder="항목명"
            maxLength={30}
            className="w-full px-3 py-2.5 text-sm font-medium outline-none transition-all"
            style={{
              ...inputStyle,
              borderColor: showNameError ? 'var(--danger)' : 'var(--hairline)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--info)')}
            onBlurCapture={(e) => (e.target.style.borderColor = showNameError ? 'var(--danger)' : 'var(--hairline)')}
          />
          {showNameError && (
            <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
              항목명을 입력해주세요
            </p>
          )}
        </div>

        <div className="relative w-32 shrink-0">
          <input
            type="text"
            inputMode="numeric"
            aria-label="금액 (원)"
            value={amountRaw}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            placeholder="0"
            className="w-full px-3 py-2.5 pr-8 text-right text-sm font-medium outline-none transition-all"
            style={{ ...inputStyle, fontFamily: 'var(--font-number)' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--info)')}
            onBlurCapture={(e) => (e.target.style.borderColor = 'var(--hairline)')}
          />
          <span aria-hidden="true" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--on-dark-mute)' }}>
            원
          </span>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          aria-label={`${item.name || '항목'} 삭제`}
          className="p-2.5 shrink-0 transition-colors"
          style={{ color: 'var(--on-dark-mute)', backgroundColor: 'var(--surface-input)', borderRadius: 'var(--radius-input)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-dark-mute)')}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>

      {/* 비율 바 */}
      {showRatioBar && (
        <div className="mt-1.5 flex items-center gap-2 px-0.5">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-input)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(ratio, 100)}%`,
                backgroundColor: ratio > 30 ? 'var(--danger)' : ratio > 15 ? '#f59e0b' : 'var(--success)',
              }}
            />
          </div>
          <span className="text-xs shrink-0" style={{ color: 'var(--muted)', fontFamily: 'var(--font-number)', minWidth: '36px', textAlign: 'right' }}>
            {ratio.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}
