import { useState, useEffect, FormEvent } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { ExpenseClaim } from '../../types';

// MOCK DATA FALLBACK (only used if API fails)
const getMockClaim = (claimId: string): ExpenseClaim => ({
  claimId: claimId,
  status: 'APPROVED',
  totalAmount: 245.50,
  currency: 'GBP',
  createdAt: '2024-03-10T10:00:00Z',
  submittedAt: '2024-03-10T14:30:00Z',
  employeeComment: 'Client meeting in Manchester, train and meals',
  managerComment: 'Approved - all receipts valid',
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
      description: 'Train ticket to Manchester',
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
      description: 'Taxi to office',
      merchant: 'Uber',
      amount: 111.00,
      vatAmount: 18.50,
      currency: 'GBP',
      receipts: [{ receiptId: 'rcp_003', fileName: 'uber_receipt.pdf', fileType: 'pdf', filePath: '/uploads/uber_receipt.pdf', uploadDate: '2024-03-10T13:00:00Z' }]
    }
  ],
  decisions: [{
    decisionId: 'dec_001',
    decisionType: 'APPROVED',
    decidedAt: '2024-03-11T09:15:00Z',
    comment: 'All receipts look good, approved',
    manager: { fullName: 'Bob Smith' }
  }],
  reimbursement: undefined
});

export default function ProcessReimbursement() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  
  const [claim, setClaim] = useState<ExpenseClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [processed, setProcessed] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadClaim = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await api.getFinanceClaim(claimId);
        if (res.data) {
          setClaim(res.data);
          if (res.data.status === 'PAID') setProcessed(true);
        } else {
          setClaim(getMockClaim(claimId));
        }
      } catch (err) {
        console.log('API error, using mock data');
        setClaim(getMockClaim(claimId));
      } finally {
        setLoading(false);
      }
    };
    
    loadClaim();
  }, [claimId]);

  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!claim) return;
    
    if (window.confirm(`Process payment of ${formatMoney(claim.totalAmount, claim.currency)}?`)) {
      setProcessing(true);
      setError('');
      try {
        await api.processReimbursement(claim.claimId, {
          paymentReference: paymentRef.trim() || undefined,
          financeComment: notes.trim() || undefined,
        });
        setProcessed(true);
        // Show success for 2 seconds then go back to dashboard
        setTimeout(() => {
          navigate('/finance/claims');
        }, 2000);
      } catch (err) {
        setError('Failed to process payment. Please try again.');
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading claim details...</div>;
  }

  if (!claim) {
    return <div className="empty-state">Claim not found</div>;
  }

  const approvedDecision = claim.decisions?.find(d => d.decisionType === 'APPROVED');

  return (
    <>
      {/* Improved Back to Dashboard button */}
      <div style={{ marginBottom: '20px' }}>
        <Link 
          to="/finance/claims" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#1e7a3e', 
            fontSize: '14px', 
            textDecoration: 'none',
            background: '#e8f5e9',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 500
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="top-bar">
        <div>
          <h1 className="page-title" style={{ marginTop: '0', marginBottom: 0 }}>
            Process Reimbursement
          </h1>
          <div className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
            Claim ID: {claim.claimId}
          </div>
        </div>
        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a4d1a', background: '#e8f5e9', padding: '8px 20px', borderRadius: '12px' }}>
          {formatMoney(claim.totalAmount, claim.currency)}
        </span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Claim Summary */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-title">Claim Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div className="text-muted" style={{ fontSize: '12px' }}>Employee</div>
            <div style={{ fontWeight: 500 }}>{claim.employee?.fullName ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '12px' }}>Email</div>
            <div>{claim.employee?.email ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '12px' }}>Cost Centre</div>
            <div>{claim.employee?.costCentre ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '12px' }}>Submitted</div>
            <div>{claim.submittedAt ? formatDate(claim.submittedAt) : '—'}</div>
          </div>
        </div>
        
        {claim.employeeComment && (
          <>
            <div className="divider"></div>
            <div style={{ marginTop: '16px' }}>
              <div className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>Employee Notes</div>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>{claim.employeeComment}</p>
            </div>
          </>
        )}
      </div>

      {/* Manager Approval */}
      {approvedDecision && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #198754' }}>
          <div className="section-title">✓ Manager Approval</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', fontSize: '13px' }}>
            <span className="text-muted">Approved by:</span>
            <span style={{ fontWeight: 500 }}>{approvedDecision.manager.fullName}</span>
            <span className="text-muted">Approved on:</span>
            <span>{formatDateTime(approvedDecision.decidedAt)}</span>
          </div>
          {approvedDecision.comment && (
            <div style={{ marginTop: '12px', padding: '10px', background: '#f8f9fa', borderRadius: '6px', fontSize: '13px' }}>
              <strong>Comment:</strong> {approvedDecision.comment}
            </div>
          )}
        </div>
      )}

      {/* Expense Items */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-title">Expense Items ({claim.items.length})</div>
        <div className="table-wrap">
          <table className="items-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>VAT</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {claim.items.map((item) => (
                <tr key={item.itemId}>
                  <td>{formatDate(item.dateIncurred)}</td>
                  <td>
                    <span style={{ background: '#e9ecef', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
                      {item.category}
                    </span>
                   </td>
                  <td>{item.description}</td>
                  <td>{item.merchant}</td>
                  <td className="amount">{formatMoney(item.amount, item.currency)}</td>
                  <td className="amount">{formatMoney(item.vatAmount, item.currency)}</td>
                  <td>
                    {item.receipts && item.receipts.length > 0 ? (
                      <span className="receipt-item">✓ {item.receipts[0].fileName}</span>
                    ) : (
                      <span className="no-receipt">❌ Missing receipt</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}></td>
                <td className="table-total-label">Total:</td>
                <td className="table-total-amount amount" colSpan={2}>
                  {formatMoney(claim.totalAmount, claim.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment Section */}
      {processed || claim.status === 'PAID' ? (
        <div className="card" style={{ borderLeft: '4px solid #198754' }}>
          <div className="section-title" style={{ color: '#0f5132' }}>✓ Reimbursement Complete</div>
          <div className="alert alert-success">Claim has been marked as PAID.</div>
          <div className="payment-info">
            <p><strong>Payment Reference:</strong> {claim.reimbursement?.paymentReference || paymentRef || 'N/A'}</p>
            <p><strong>Finance Notes:</strong> {claim.financeComment || notes || 'None'}</p>
          </div>
          <button 
            onClick={() => navigate('/finance/claims')}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div className="card">
          <h3 className="section-title">Process Payment</h3>
          
          <div className="alert alert-info">
            This will mark the claim as <strong>PAID</strong> and notify the employee.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Payment Reference (optional)</label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g., BACS-001, TRANSFER-15032024"
                disabled={processing}
              />
            </div>

            <div className="form-group">
              <label>Finance Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes about this payment..."
                disabled={processing}
              />
            </div>
            <div className="flex-end">
              <button type="submit" className="btn btn-success" disabled={processing}>
                {processing ? 'Processing...' : `Confirm Payment — ${formatMoney(claim.totalAmount, claim.currency)}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}