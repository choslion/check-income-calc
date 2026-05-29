import { Plus } from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { ExpenseItem } from './ExpenseItem'
import { formatKRW } from '../lib/calc'
import type { ExpenseItem as ExpenseItemType } from '../types'

interface Props {
  type: 'fixed' | 'variable'
}

const LABELS = { fixed: '고정 지출', variable: '변동 지출' }

export function ExpenseList({ type }: Props) {
  const { state, dispatch } = useBudget()
  const items = type === 'fixed' ? state.fixedExpenses : state.variableExpenses
  // 이름 있는 항목만 합계 표시
  const total = items.filter(e => e.name.trim() !== '').reduce((sum, e) => sum + e.amount, 0)

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
    <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '24px' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--on-dark-mute)' }}>
          {LABELS[type]}
        </p>
        {total > 0 && (
          <span className="text-sm font-semibold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}>
            {formatKRW(total)}원
          </span>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ExpenseItem
            key={item.id}
            item={item}
            salary={state.salary}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: 'var(--on-dark-mute)' }}>
          등록된 항목이 없습니다
        </p>
      )}

      <button
        onClick={handleAdd}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors"
        style={{ color: 'var(--on-primary)', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-pill)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
      >
        <Plus size={15} />
        항목 추가
      </button>
    </div>
  )
}
