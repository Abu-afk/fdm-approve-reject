import { useState, useEffect } from 'react'

type ClaimStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'

interface Claim {
  id: string
  status: ClaimStatus
  employeeId: string
  totalAmount: number
  description: string
  createdAt: string
}

const API = 'http://localhost:3001/api/manager'

const statusColor: Record<ClaimStatus, string> = {
  SUBMITTED: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  CHANGES_REQUESTED: '#6366f1',
}

export default function App() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [selected, setSelected] = useState<Claim | null>(null)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchClaims = async () => {
    setLoading(true)
    const res = await fetch(`${API}/claims`)
    const data = await res.json()
    setClaims(data.data)
    setLoading(false)
  }

  useEffect(() => { fetchClaims() }, [])

  const handleAction = async (action: 'approve' | 'reject' | 'request-changes') => {
    if (!selected) return
    if ((action === 'reject' || action === 'request-changes') && !comment) {
      setMessage('Please enter a comment first!')
      return
    }
    const res = await fetch(`${API}/claims/${selected.id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId: 'manager1', comment }),
    })
    const data = await res.json()
    setMessage(data.message)
    setSelected(null)
    setComment('')
    fetchClaims()
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>
        📋 Pending Claims
      </h1>

      {message && (
        <div style={{ background: '#d1fae5', border: '1px solid #10b981', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          ✅ {message}
        </div>
      )}

      {loading ? <p>Loading...</p> : claims.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No pending claims.</p>
      ) : (
        claims.map(claim => (
          <div key={claim.id} onClick={() => { setSelected(claim); setMessage(''); setComment('') }}
            style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{claim.description}</strong>
              <span style={{ background: statusColor[claim.status], color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 12 }}>
                {claim.status}
              </span>
            </div>
            <p style={{ margin: '4px 0', color: '#374151' }}>£{claim.totalAmount} · Employee: {claim.employeeId}</p>
          </div>
        ))
      )}

      {selected && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e5e7eb', padding: 16, boxShadow: '0 -4px 12px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px' }}>Review: {selected.description}</h3>
          <textarea
            placeholder="Add a comment (required for reject/request changes)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }}
            rows={3}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleAction('approve')}
              style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, cursor: 'pointer' }}>
              ✅ Approve
            </button>
            <button onClick={() => handleAction('reject')}
              style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, cursor: 'pointer' }}>
              ❌ Reject
            </button>
            <button onClick={() => handleAction('request-changes')}
              style={{ flex: 1, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: 12, fontSize: 15, cursor: 'pointer' }}>
              🔄 Changes
            </button>
          </div>
          <button onClick={() => setSelected(null)}
            style={{ width: '100%', marginTop: 8, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 10, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}