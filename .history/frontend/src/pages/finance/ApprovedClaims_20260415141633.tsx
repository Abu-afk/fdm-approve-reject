import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { ExpenseClaim } from '../../types';

type FilterStatus = 'ALL' | 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'PAID';

// Complete mock data with ALL statuses
const getInitialMockClaims = (): ExpenseClaim[] => [
  {
    claimId: 'CLM-001',
    status: 'APPROVED',
    totalAmount: 245.50,
    currency: 'GBP',
    createdAt: '2024-03-10T10:00:00Z',
    submittedAt: '2024-03-10T10:30:00Z',
    employeeComment: 'Business trip to London for client meeting',
    managerComment: 'Valid expenses - approved',
    financeComment: undefined,
    employee: {
      fullName: 'Alice Johnson',
      email: 'alice.johnson@fdm.com',
      costCentre: 'CC-ENG-001'
    },
    items: [
      {
        itemId: 'itm_001',
        dateIncurred: '2024-03-09T00:00:00Z',
        category: 'TRAVEL',
        description: 'Train ticket to London',
        merchant: 'National Rail',
        amount: 89.50,
        vatAmount: 0,
        currency: 'GBP',
        receipts: [{ receiptId: 'rcp_001', fileName: 'train_ticket.pdf', fileType: 'pdf', filePath: '/uploads/train_ticket.pdf', uploadDate: '2024-03-10T12:00:00Z' }]
      },
      {
        itemId: 'itm_002',
        dateIncurred: '2024-03-09T00:00:00Z',
        category: 'MEAL',
        description: 'Working lunch with client',
        merchant: 'Cafe Rouge',
        amount: 45.00,
        vatAmount: 7.50,
        currency: 'GBP',
        receipts: [{ receiptId: 'rcp_002', fileName: 'lunch_receipt.jpg', fileType: 'jpg', filePath: '/uploads/lunch_receipt.jpg', uploadDate: '2024-03-10T12:30:00Z' }]
      },
      {
        itemId: 'itm_003',
        dateIncurred: '2024-03-10T00:00:00Z',
        category: 'TAXI',
        description: 'Taxi to client office',
        merchant: 'Uber',
        amount: 111.00,
        vatAmount: 18.50,
        currency: 'GBP',
        receipts: [{ receiptId: 'rcp_003', fileName: 'uber_receipt.pdf', fileType: 'pdf', filePath: '/uploads/uber_receipt.pdf', uploadDate: '2024-03-10T13:00:00Z' }]
      }
    ],
    decisions: [{
      decisionId: 'DEC-001',
      decisionType: 'APPROVED',
      decidedAt: '2024-03-11T09:00:00Z',
      comment: 'All receipts valid - approved',
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
    employeeComment: 'Client meeting lunch and travel',
    managerComment: 'Approved - within policy',
    financeComment: undefined,
    employee: {
      fullName: 'David Chen',
      email: 'david.chen@fdm.com',
      costCentre: 'CC-CON-045'
    },
    items: [
      {
        itemId: 'itm_004',
        dateIncurred: '2024-03-11T00:00:00Z',
        category: 'MEAL',
        description: 'Lunch with client team',
        merchant: 'The Ivy',
        amount: 78.50,
        vatAmount: 13.08,
        currency: 'GBP',
        receipts: [{ receiptId: 'rcp_004', fileName: 'ivy_receipt.pdf', fileType: 'pdf', filePath: '/uploads/ivy_receipt.pdf', uploadDate: '2024-03-12T14:00:00Z' }]
      },
      {
        itemId: 'itm_005',
        dateIncurred: '2024-03-11T00:00:00Z',
        category: 'TRAVEL',
        description: 'Underground fares',
        merchant: 'TfL',
        amount: 111.49,
        vatAmount: 0,
        currency: 'GBP',
        receipts: [{ receiptId: 'rcp_005', fileName: 'tfl_charges.pdf', fileType: 'pdf', filePath: '/uploads/tfl_charges.pdf', uploadDate: '2024-03-12T14:10:00Z' }]
      }
    ],
    decisions: [{
      decisionId: 'DEC-002',
      decisionType: 'APPROVED',
      decidedAt: '2024-03-13T11:00:00Z',
      comment: 'Looks good - approved',
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
    employeeComment: 'Training course materials for team',
    managerComment: 'Approved for professional development',
    financeComment: 'Processed via BACS transfer on 07/03/2024',
    employee: {
      fullName: 'Emma Brown',
      email: 'emma.brown@fdm.com',
      costCentre: 'CC-HR-023'
    },
    items: [
      {
        itemId: 'itm_006',
        dateIncurred: '2024-03-04T00:00:00Z',
        category: 'TRAINING',
        description: 'Online course - Advanced React',
        merchant: 'Udemy',
        amount: 432.10,
        vatAmount: 72.02,
        currency: 'GBP',
        receipts: [{ receiptId: 'rcp_006', fileName: 'udemy_receipt.pdf', fileType: 'pdf', filePath: '/uploads/udemy_receipt.pdf', uploadDate: '2024-03-05T08:30:00Z' }]
      }
    ],
    decisions: [{
      decisionId: 'DEC-003',
      decisionType: 'APPROVED',
      decidedAt: '2024-03-06T10:00:00Z',
      comment: 'Approved for training - within budget',
      manager: { fullName: 'Sarah Lee' }
    }],
    reimbursement: {
      reimbursementId: 'REIM-001',
      processedAt: '2024-03-07T14:00:00Z',
      paidAt: '2024-03-07T14:00:00Z',
      paymentReference: 'BACS-20240307-001',
      amountPaid: 432.10,
      currency: 'GBP'
    }
  },
  {
    claimId: 'CLM-004',
    status: 'SUBMITTED',
    totalAmount: 98.50,
    currency: 'GBP',
    createdAt: '2024-03-14T09:00:00Z',
    submittedAt: '2024-03-14T09:30:00Z',
    employeeComment: 'Taxi receipts from client visit',
    managerComment: undefined,
    financeComment: undefined,
    employee: {
      fullName: 'Tom Wilson',
      email: 'tom.wilson@fdm.com',
      costCentre: 'CC-IT-089'
    },
    items: [
      {
        itemId: 'itm_007',
        dateIncurred: '2024-03-13T00:00:00Z',
        category: 'TAXI',
        description: 'Airport transfer',
        merchant: 'Addison Lee',
        amount: 98.50,
        vatAmount: 16.42,
        currency: 'GBP',
        receipts: [{ receiptId: 'rcp_007', fileName: 'taxi_receipt.pdf', fileType: 'pdf', filePath: '/uploads/taxi_receipt.pdf', uploadDate: '2024-03-14T09:15:00Z' }]
      }
    ],
    decisions: [],
    reimbursement: undefined
  },
  {
    claimId: 'CLM-005',
    status: 'REJECTED',
    totalAmount: 567.80,
    currency: 'GBP',
    createdAt: '2024-03-08T11:00:00Z',
    submittedAt: '2024-03-08T11:45:00Z',
    employeeComment: 'Conference travel and accommodation',
    managerComment: 'Missing receipts for hotel stay',
    financeComment: undefined,
    employee: {
      fullName: 'Maria Garcia',
      email: 'maria.garcia@fdm.com',
      costCentre: 'CC-SALES-012'
    },
    items: [
      {
        itemId: 'itm_008',
        dateIncurred: '2024-03-07T00:00:00Z',
        category: 'TRAVEL',
        description: 'Flight to conference',
        merchant: 'British Airways',
        amount: 245.00,
        vatAmount: 0,
        currency: 'GBP',
        receipts: [{ receiptId: 'rcp_008', fileName: 'flight_ticket.pdf', fileType: 'pdf', filePath: '/uploads/flight_ticket.pdf', uploadDate: '2024-03-08T11:00:00Z' }]
      },
      {
        itemId: 'itm_009',
        dateIncurred: '2024-03-07T00:00:00Z',
        category: 'HOTEL',
        description: 'Hotel accommodation',
        merchant: 'Marriott',
        amount: 322.80,
        vatAmount: 53.80,
        currency: 'GBP',
        receipts: []
      }
    ],
    decisions: [{
      decisionId: 'DEC-004',
      decisionType: 'REJECTED',
      decidedAt: '2024-03-09T14:00:00Z',
      comment: 'Missing receipts for hotel stay - please resubmit with proper documentation',
      manager: { fullName: 'Bob Smith' }
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

  // Listen for payment processed events from sessionStorage
  useEffect(() => {
    const checkForProcessedPayment = () => {
      const processedClaimId = sessionStorage.getItem('processedClaimId');
      if (processedClaimId) {
        setClaims(prevClaims => 
          prevClaims.map(claim => 
            claim.claimId === processedClaimId 
              ? { ...claim, status: 'PAID' as const }
              : claim
          )
        );
        sessionStorage.removeItem('processedClaimId');
      }
    };
    
    checkForProcessedPayment();
  }, []);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const res = await api.getFinanceApprovedClaims();
        if (res.data && res.data.length > 0) {
          setClaims(res.data);
        } else {
          setClaims(getInitialMockClaims());
        }
      } catch (err) {
        console.log('API error, using mock data');
        setClaims(getInitialMockClaims());
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
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: '#1e7a3e', color: 'white', padding: '8px 20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{getFilterCount('APPROVED')}</div>
            <div style={{ fontSize: '12px' }}>Ready to Process</div>
          </div>
          <div style={{ background: '#0f5132', color: 'white', padding: '8px 20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{getFilterCount('PAID')}</div>
            <div style={{ fontSize: '12px' }}>Completed</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search by employee name, email, or claim ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px 16px', 
            border: '1px solid #dee2e6', 
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar" style={{ marginBottom: '20px' }}>
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
    </>
  );
}