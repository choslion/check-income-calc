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

  function handleImportSubscription() {
    dispatch({ type: 'UPSERT_SUBSCRIPTION_EXPENSE', payload: Math.round(subSummary.monthlyTotal) })
  }

  const importedItem = type === 'fixed' ? state.fixedExpenses.find(e => e.source === 'subscription') : undefined

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

        {/* Subscription import CTA */}
        {type === 'fixed' && subSummary.count > 0 && (
          <div
            className="flex flex-col gap-2.5 p-3"
            style={{ backgroundColor: 'var(--surface-input)', borderRadius: 'var(--radius-input)', border: '1px solid var(--hairline)' }}
          >
            <p className="text-xs" style={{ color: 'var(--on-dark-mute)', lineHeight: 1.5 }}>
              구독 계산기에서 계산된 월 구독비{' '}
              <span className="font-semibold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}>
                {formatKRW(Math.round(subSummary.monthlyTotal))}원
              </span>
              을 불러올 수 있습니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleImportSubscription}
                className="flex-1 text-xs font-semibold py-1.5"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
              >
                {importedItem ? '구독비 업데이트' : '구독비 불러오기'}
              </button>
              <button
                onClick={() => navigate('/tools/subscription')}
                className="flex items-center text-xs font-semibold px-3 py-1.5 shrink-0"
                style={{ backgroundColor: 'transparent', color: 'var(--primary)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--hairline)', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
              >
                구독 계산기 <ChevronRight size={12} style={{ marginLeft: 2 }} />
              </button>
            </div>
          </div>
        )}

        {/* Suggestion when no subscription data */}
        {type === 'fixed' && subSummary.count === 0 && (
          <button
            onClick={() => navigate('/tools/subscription')}
            className="w-full flex items-center justify-between text-xs px-3 py-2.5"
            style={{ backgroundColor: 'transparent', borderRadius: 'var(--radius-input)', border: '1px dashed var(--hairline)', color: 'var(--on-dark-mute)', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
          >
            <span>매달 빠져나가는 구독이 많다면 구독 계산기에서 먼저 정리해 보세요.</span>
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
