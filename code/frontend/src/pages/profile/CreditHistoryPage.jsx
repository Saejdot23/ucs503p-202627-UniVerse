import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { creditsApi } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/ErrorState'

const TYPE_LABELS = {
  initial_credit: { label: 'Initial Credits', color: '#98c379' },
  session_teach: { label: 'Teaching Session', color: '#98c379' },
  session_learn: { label: 'Learning Session', color: '#e06c75' },
  admin_deduct: { label: 'Admin Deduction', color: '#e06c75' },
}

export default function CreditHistoryPage() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['creditHistory'],
    queryFn: () => creditsApi.getHistory(),
    select: (res) => res.data?.data,
  })

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--warm-cream)', margin: 0 }}>Credit History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Current balance:{' '}
          <strong style={{ color: 'var(--warm-cream)', fontSize: 20 }}>{user?.credits ?? 0}</strong>{' '}
          credits
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : !data?.transactions?.length ? (
        <EmptyState message="No credit transactions yet." icon="◎" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.transactions.map(tx => {
            const meta = TYPE_LABELS[tx.type] || { label: tx.type, color: 'var(--text-muted)' }
            const sign = tx.amount >= 0 ? '+' : ''
            return (
              <div key={tx._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{meta.label}</p>
                  {tx.description && (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{tx.description}</p>
                  )}
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-serif)', color: meta.color }}>
                    {sign}{tx.amount}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Balance: {tx.balanceAfter}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
