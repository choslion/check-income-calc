import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { ExpenseItem } from './ExpenseItem'
import { formatKRW } from '../lib/calc'
import { getSubscriptionSummary } from '../lib/crossToolData'
import type { ExpenseItem as ExpenseItemType } from '../types'

interface Props {
  type: 'fixed' | 'variable'
}

const LABELS = { fixed: '고정 지출', variable: '변동 지출' }

export function ExpenseList({ type }: Props) {
  const navigate = useNavigate()
  const { state, dispatch } = useBudget()
  const items = type === 'fixed' ? state.fixedExpenses : state.variableExpenses
  const [subSummary] = useState(() =>
    type === 'fixed' ? getSubscriptionSummary() : { monthlyTotal: 0, count: 0 }
  )
  const validItems = items.filter(e => e.name.trim() !== '')
  // 이름 있는 항목만 합계 표시
  const total = validItems.reduce((sum, e) => sum + e.amount, 0)

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

        {/* Subscription sync row */}
        {type === 'fixed' && subSummary.count > 0 && (
          <div
            className="flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--surface-input)', borderRadius: 'var(--radius-input)', border: '1px solid var(--hairline)' }}
            onClick={() => navigate('/tools/subscription')}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--on-dark)' }}>구독 서비스</span>
              <span
                className="text-xs px-1.5 py-0.5"
                style={{ backgroundColor: 'var(--surface-card)', color: 'var(--primary)', borderRadius: 'var(--radius-pill)', fontSize: 10, border: '1px solid var(--hairline)' }}
              >
                자동 연동 · {subSummary.count}개
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}>
                {formatKRW(Math.round(subSummary.monthlyTotal))}원
              </span>
              <ChevronRight size={13} style={{ color: 'var(--on-dark-mute)' }} />
            </div>
          </div>
        )}

        {/* Suggestion when no subscription data and many fixed expenses */}
        {type === 'fixed' && subSummary.count === 0 && validItems.length >= 4 && (
          <button
            onClick={() => navigate('/tools/subscription')}
            className="w-full flex items-center justify-between text-xs px-3 py-2.5"
            style={{ backgroundColor: 'transparent', borderRadius: 'var(--radius-input)', border: '1px dashed var(--hairline)', color: 'var(--on-dark-mute)', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
          >
            <span>넷플릭스·유튜브 등 구독 서비스가 있다면 구독 계산기를 이용해보세요</span>
            <ChevronRight size={12} style={{ color: 'var(--primary)', flexShrink: 0, marginLeft: 8 }} />
          </button>
        )}
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
