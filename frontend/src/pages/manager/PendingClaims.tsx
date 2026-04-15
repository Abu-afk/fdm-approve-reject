import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseClaim } from '../../types';
import * as api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const ITEMS_PER_PAGE = 10;

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB');

type SortField = 'employee' | 'date' | 'amount' | 'status';
type SortDir = 'asc' | 'desc';

export default function PendingClaims() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getManagerPendingClaims()
      .then((res) => setClaims(res.data))
      .catch(() => setError('Failed to load pending claims.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const sortArrow = (field: SortField) =>
    sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  // Filter
  const filtered = claims.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (c.employee?.fullName || '').toLowerCase().includes(q) ||
      (c.employee?.email || '').toLowerCase().includes(q) ||
      (c.employeeComment || '').toLowerCase().includes(q);
    const matchMin = !minAmount || c.totalAmount >= parseFloat(minAmount);
    const matchMax = !maxAmount || c.totalAmount <= parseFloat(maxAmount);
    const matchFrom = !fromDate || new Date(c.submittedAt || c.createdAt) >= new Date(fromDate);
    const matchTo = !toDate || new Date(c.submittedAt || c.createdAt) <= new Date(toDate);
    return matchSearch && matchMin && matchMax && matchFrom && matchTo;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortField === 'employee') diff = (a.employee?.fullName || '').localeCompare(b.employee?.fullName || '');
    if (sortField === 'date') diff = new Date(a.submittedAt || a.createdAt).getTime() - new Date(b.submittedAt || b.createdAt).getTime();
    if (sortField === 'amount') diff = a.totalAmount - b.totalAmount;
    if (sortField === 'status') diff = a.status.localeCompare(b.status);
    return sortDir === 'asc' ? diff : -diff;
  });

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map(c => c.claimId));

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Approve ${selectedIds.length} claim(s)?`)) return;
    setBulkLoading(true);
    setError('');
    try {
      await Promise.all(selectedIds.map(id => api.approveClaim(id)));
      setClaims(prev => prev.filter(c => !selectedIds.includes(c.claimId)));
      setSuccessMsg(`${selectedIds.length} claim(s) approved successfully.`);
      setSelectedIds([]);
    } catch {
      setError('Some claims could not be approved. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch(''); setMinAmount(''); setMaxAmount('');
    setFromDate(''); setToDate(''); setPage(1);
  };

  return (
    <>
      <div className="top-bar">
        <h1 className="page-title" style={{ margin: 0 }}>Pending Claims for Review</h1>
        <span className="text-muted">{filtered.length} claim{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--grey-500)', display: 'block', marginBottom: 4 }}>SEARCH</label>
            <input
              type="text"
              placeholder="Employee name or description…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ padding: '7px 12px', borderRadius: 6, border: '1.5px solid var(--grey-200)', fontSize: 13, width: 220 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--grey-500)', display: 'block', marginBottom: 4 }}>MIN AMOUNT (£)</label>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={e => { setMinAmount(e.target.value); setPage(1); }}
              style={{ padding: '7px 12px', borderRadius: 6, border: '1.5px solid var(--grey-200)', fontSize: 13, width: 100 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--grey-500)', display: 'block', marginBottom: 4 }}>MAX AMOUNT (£)</label>
            <input
              type="number"
              placeholder="9999"
              value={maxAmount}
              onChange={e => { setMaxAmount(e.target.value); setPage(1); }}
              style={{ padding: '7px 12px', borderRadius: 6, border: '1.5px solid var(--grey-200)', fontSize: 13, width: 100 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--grey-500)', display: 'block', marginBottom: 4 }}>FROM DATE</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setPage(1); }}
              style={{ padding: '7px 12px', borderRadius: 6, border: '1.5px solid var(--grey-200)', fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--grey-500)', display: 'block', marginBottom: 4 }}>TO DATE</label>
            <input
              type="date"
              value={toDate}
              onChange={e => { setToDate(e.target.value); setPage(1); }}
              style={{ padding: '7px 12px', borderRadius: 6, border: '1.5px solid var(--grey-200)', fontSize: 13 }}
            />
          </div>
          <button onClick={clearFilters}
            style={{ padding: '7px 14px', borderRadius: 6, border: '1.5px solid var(--grey-200)', background: '#fff', fontSize: 13, cursor: 'pointer', color: 'var(--grey-500)' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Bulk Approve Bar */}
      {selectedIds.length > 0 && (
        <div style={{ background: '#d1e7dd', border: '1px solid #a3cfbb', borderRadius: 8, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f5132' }}>{selectedIds.length} claim(s) selected</span>
          <button onClick={handleBulkApprove} disabled={bulkLoading}
            style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#198754', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {bulkLoading ? 'Approving…' : `✓ Approve ${selectedIds.length} Selected`}
          </button>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading claims…</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="icon">✅</div>
            <p>{claims.length === 0 ? 'No pending claims to review.' : 'No claims match your filters.'}</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox"
                        checked={paginated.length > 0 && selectedIds.length === paginated.length}
                        onChange={toggleSelectAll} />
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('employee')}>
                      Employee{sortArrow('employee')}
                    </th>
                    <th>Cost Centre</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                      Submitted{sortArrow('date')}
                    </th>
                    <th>Items</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('amount')}>
                      Total{sortArrow('amount')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                      Status{sortArrow('status')}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((claim) => (
                    <tr key={claim.claimId} className="clickable-row"
                      onClick={() => navigate(`/manager/claims/${claim.claimId}`)}>
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox"
                          checked={selectedIds.includes(claim.claimId)}
                          onChange={() => toggleSelect(claim.claimId)} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{claim.employee?.fullName ?? '—'}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{claim.employee?.email ?? ''}</div>
                      </td>
                      <td>{claim.employee?.costCentre ?? '—'}</td>
                      <td>{claim.submittedAt ? fmtDate(claim.submittedAt) : '—'}</td>
                      <td>{claim.items.length}</td>
                      <td className="amount">{fmt(claim.totalAmount, claim.currency)}</td>
                      <td><StatusBadge status={claim.status} /></td>
                      <td><span style={{ color: '#1e7a3e', fontSize: '12px' }}>Review →</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--grey-500)' }}>
                Showing {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, sorted.length)} of {sorted.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid var(--grey-200)', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1.5px solid', borderColor: p === page ? '#00D600' : 'var(--grey-200)', background: p === page ? '#00D600' : '#fff', fontWeight: p === page ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid var(--grey-200)', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}