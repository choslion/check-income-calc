import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { ExpenseItem as ExpenseItemType } from '../types'
import { formatKRW, parseAmount } from '../lib/calc'

interface Props {
  item: ExpenseItemType
  onUpdate: (item: ExpenseItemType) => void
  onDelete: (id: string) => void
}

export function ExpenseItem({ item, onUpdate, onDelete }: Props) {
  const [amountRaw, setAmountRaw] = useState(item.amount > 0 ? formatKRW(item.amount) : '')
  const [nameError, setNameError] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNameError(false)
    onUpdate({ ...item, name: e.target.value.slice(0, 30) })
  }

  function handleNameBlur() {
    if (!item.name.trim()) setNameError(true)
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

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-input)',
    color: 'var(--on-dark)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--radius-input)',
  }

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <input
          type="text"
          value={item.name}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          placeholder="항목명"
          maxLength={30}
          className="w-full px-3 py-2.5 text-sm font-medium outline-none transition-all"
          style={{
            ...inputStyle,
            borderColor: nameError ? 'var(--danger)' : 'var(--hairline)',
          }}
          onFocus={(e) => { setNameError(false); e.target.style.borderColor = 'var(--info)' }}
          onBlurCapture={(e) => (e.target.style.borderColor = nameError ? 'var(--danger)' : 'var(--hairline)')}
        />
        {nameError && (
          <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
            항목명을 입력해주세요
          </p>
        )}
      </div>

      <div className="relative w-36">
        <input
          type="text"
          inputMode="numeric"
          value={amountRaw}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          placeholder="0"
          className="w-full px-3 py-2.5 pr-8 text-right text-sm font-medium outline-none transition-all"
          style={{ ...inputStyle, fontFamily: 'var(--font-number)' }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--info)')}
          onBlurCapture={(e) => (e.target.style.borderColor = 'var(--hairline)')}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>
          원
        </span>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="p-2.5 shrink-0 transition-colors"
        style={{
          color: 'var(--on-dark-mute)',
          backgroundColor: 'var(--surface-input)',
          borderRadius: 'var(--radius-input)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-dark-mute)')}
        aria-label="항목 삭제"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
