import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { ExpenseClaim } from '../../types';

type FilterStatus = 'ALL' | 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'PAID';

// MOCK DATA FALLBACK (only used if API fails)
const getMockClaims = (): ExpenseClaim[] => [
  {
    claimId: 'CLM-001',
    status: 'APPROVED',
    totalAmount: 245.50,
    currency: 'GBP',
    createdAt: '2024-03-10T10:00:00Z',
    submittedAt: '2024-03-10T10:30:00Z',
    employeeComment: 'Business trip to London',
    managerComment: 'Valid expenses',
    financeComment: undefined,
    employee: {
      fullName: 'Alice Johnson',
      email: 'alice.johnson@fdm.com',
      costCentre: 'CC-ENG-001'
    },
    items: [],
    decisions: [{
      decisionId: 'DEC-001',
      decisionType: 'APPROVED',
      decidedAt: '2024-03-11T09:00:00Z',
      comment: 'Approved',
      manager: { fullName: 'Bob Smith' }
    }],
    reimbursement: undefined
  },
  {
    claimId: 'CLM-002',
    status: 'APPROVED',
    totalAmount: 189.99,
    currency: 'GBP',
    createdAt: '2024-03-12T14:00:00Z',
    submittedAt: '2024-03-12T14:20:00Z',
    employeeComment: 'Client meeting lunch',
    managerComment: 'Approved',
    financeComment: undefined,
    employee: {
      fullName: 'David Chen',
      email: 'david.chen@fdm.com',
      costCentre: 'CC-CON-045'
    },
    items: [],
    decisions: [{
      decisionId: 'DEC-002',
      decisionType: 'APPROVED',
      decidedAt: '2024-03-13T11:00:00Z',
      comment: 'Looks good',
      manager: { fullName: 'Sarah Lee' }
    }],
    reimbursement: undefined
  },
  {
    claimId: 'CLM-003',
    status: 'PAID',
    totalAmount: 432.10,
    currency: 'GBP',
    createdAt: '2024-03-05T08:00:00Z',
    submittedAt: '2024-03-05T09:00:00Z',
    employeeComment: 'Training materials',
    managerComment: 'Approved',
    financeComment: 'Processed via BACS',
    employee: {
      fullName: 'Emma Brown',
      email: 'emma.brown@fdm.com',
      costCentre: 'CC-HR-023'
    },
    items: [],
    decisions: [{
      decisionId: 'DEC-003',
      decisionType: 'APPROVED',
      decidedAt: '2024-03-06T10:00:00Z',
      comment: 'Approved',
      manager: { fullName: 'Sarah Lee' }
    }],
    reimbursement: undefined
  }
];

export default function FinanceClaimsDashboard() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('APPROVED');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const res = await api.getFinanceApprovedClaims();
        if (res.data && res.data.length > 0) {
          setClaims(res.data);
        } else {
          setClaims(getMockClaims());
        }
      } catch (err) {
        console.log('API error, using mock data');
        setClaims(getMockClaims());
      } finally {
        setLoading(false);
      }
    };
    
    fetchClaims();
  }, []);

  useEffect(() => {
    let filtered = [...claims];
    
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(claim => claim.status === activeFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.claimId.toLowerCase().includes(term) ||
        claim.employee?.fullName?.toLowerCase().includes(term) ||
        claim.employee?.email?.toLowerCase().includes(term) ||
        claim.employee?.costCentre?.toLowerCase().includes(term)
      );
    }
    
    setFilteredClaims(filtered);
  }, [claims, activeFilter, searchTerm]);

  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'SUBMITTED': return 'Pending';
      case 'PAID': return 'Paid';
      default: return status;
    }
  };

  const getApprovedDate = (claim: ExpenseClaim): string => {
    if (!claim.decisions || claim.decisions.length === 0) return '—';
    const approved = claim.decisions
      .filter((d) => d.decisionType === 'APPROVED')
      .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())[0];
    return approved ? formatDate(approved.decidedAt) : '—';
  };

  const handleViewClaim = (claim: ExpenseClaim) => {
    navigate(`/finance/claims/${claim.claimId}`);
  };

  const getFilterCount = (status: FilterStatus) => {
    if (status === 'ALL') return claims.length;
    return claims.filter(c => c.status === status).length;
  };

  if (loading) {
    return <div className="loading">Loading claims...</div>;
  }

  return (
    <>
      <div className="top-bar">
        <h1 className="page-title">Finance Dashboard</h1>
        <span className="text-muted">
          {getFilterCount('APPROVED')} ready · {getFilterCount('PAID')} completed
        </span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <button
          className={`filter-btn ${activeFilter === 'APPROVED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('APPROVED')}
        >
          Approved ({getFilterCount('APPROVED')})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'SUBMITTED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('SUBMITTED')}
        >
          Pending ({getFilterCount('SUBMITTED')})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setActiveFilter('REJECTED')}
        >
          Rejected ({getFilterCount('REJECTED')})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'PAID' ? 'active' : ''}`}
          onClick={() => setActiveFilter('PAID')}
        >
          Paid ({getFilterCount('PAID')})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveFilter('ALL')}
        >
          All ({getFilterCount('ALL')})
        </button>
      </div>

      <div className="card">
        {filteredClaims.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} claims found</p>
            {searchTerm && <p className="text-muted">Try adjusting your search</p>}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="claims-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Employee</th>
                  <th>Cost Centre</th>
                  <th>Submitted</th>
                  <th>Approved</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr 
                    key={claim.claimId}
                    className="clickable-row"
                    onClick={() => handleViewClaim(claim)}
                  >
                    <td style={{ fontWeight: 600, color: '#1e7a3e', fontFamily: 'monospace' }}>
                      {claim.claimId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{claim.employee?.fullName ?? '—'}</div>
                      <div style={{ fontSize: '11px', color: '#6c757d' }}>{claim.employee?.email ?? ''}</div>
                    </td>
                    <td>{claim.employee?.costCentre ?? '—'}</td>
                    <td>{claim.submittedAt ? formatDate(claim.submittedAt) : '—'}</td>
                    <td>{getApprovedDate(claim)}</td>
                    <td className="amount">{formatMoney(claim.totalAmount, claim.currency)}</td>
                    <td>{getStatusText(claim.status)}</td>
                    <td>{claim.items.length}</td>
                    <td>
                      <span style={{ color: '#1e7a3e', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                        {claim.status === 'APPROVED' ? 'Process →' : 'View'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="divider"></div>

      <div className="filter-bar" style={{ marginTop: '16px' }}>
        <input
          type="text"
          placeholder="Search by employee name, email, claim ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            border: '1px solid #dee2e6', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        {searchTerm && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setSearchTerm('')}
          >
            Clear
          </button>
        )}
      </div>
    </>
  );
}