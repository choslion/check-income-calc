import { Plus } from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { ExpenseItem } from './ExpenseItem'
import { formatKRW } from '../lib/calc'
import type { ExpenseItem as ExpenseItemType } from '../types'

interface Props {
  type: 'fixed' | 'variable'
}

const LABELS = {
  fixed: { title: '고정 지출', addLabel: '항목 추가' },
  variable: { title: '변동 지출', addLabel: '항목 추가' },
}

export function ExpenseList({ type }: Props) {
  const { state, dispatch } = useBudget()
  const items = type === 'fixed' ? state.fixedExpenses : state.variableExpenses
  const { title, addLabel } = LABELS[type]

  const total = items.reduce((sum, e) => sum + e.amount, 0)

  function handleAdd() {
    dispatch({ type: type === 'fixed' ? 'ADD_FIXED_EXPENSE' : 'ADD_VARIABLE_EXPENSE' })
  }

  function handleUpdate(item: ExpenseItemType) {
    dispatch({
      type: type === 'fixed' ? 'UPDATE_FIXED_EXPENSE' : 'UPDATE_VARIABLE_EXPENSE',
      payload: item,
    })
  }

  function handleDelete(id: string) {
    dispatch({
      type: type === 'fixed' ? 'DELETE_FIXED_EXPENSE' : 'DELETE_VARIABLE_EXPENSE',
      payload: id,
    })
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--color-surface-card-dark)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-base font-semibold"
          style={{ color: 'var(--color-on-dark)' }}
        >
          {title}
        </h2>
        {total > 0 && (
          <span
            className="font-mono text-sm font-medium"
            style={{ color: 'var(--color-muted-strong)', fontFamily: 'var(--font-mono)' }}
          >
            합계 {formatKRW(total)}원
          </span>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ExpenseItem
            key={item.id}
            item={item}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p
          className="text-sm text-center py-4"
          style={{ color: 'var(--color-muted)' }}
        >
          등록된 항목이 없습니다
        </p>
      )}

      <button
        onClick={handleAdd}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors"
        style={{
          color: 'var(--color-primary)',
          backgroundColor: 'var(--color-surface-elevated-dark)',
          border: '1px dashed var(--color-primary)',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = 'rgba(252,213,53,0.08)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated-dark)')
        }
      >
        <Plus size={15} />
        {addLabel}
      </button>
    </div>
  )
}
