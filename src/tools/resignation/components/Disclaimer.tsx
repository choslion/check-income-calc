import { AlertTriangle } from 'lucide-react'
import { POLICY_YEAR } from '../constants/policy'

export function Disclaimer() {
  return (
    <div
      className="p-4 rounded-xl flex gap-3"
      style={{ backgroundColor: 'var(--surface-input)', border: '1px solid var(--hairline)' }}
    >
      <AlertTriangle size={16} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: '2px' }} />
      <div className="space-y-1.5">
        <p className="text-xs font-semibold" style={{ color: 'var(--on-dark-mute)' }}>
          참고용 추정 계산기 ({POLICY_YEAR}년 기준)
        </p>
        <ul className="text-xs space-y-1" style={{ color: 'var(--muted)' }}>
          <li>· 이 계산기의 결과는 법적 효력이 없는 참고용 추정치입니다.</li>
          <li>· 실제 퇴직금은 회사 정산 방식, 세금, 상여금, 미사용 연차, 퇴직연금 종류에 따라 달라질 수 있습니다.</li>
          <li>· 실업급여 수급 자격 및 지급액은 고용센터에서 최종 결정합니다.</li>
          <li>· 중요한 결정은 반드시 고용노동부 고객상담센터(1350) 또는 고용센터를 통해 확인하세요.</li>
          <li>· 입력한 정보는 이 기기에만 저장되며 외부로 전송되지 않습니다.</li>
        </ul>
      </div>
    </div>
  )
}
