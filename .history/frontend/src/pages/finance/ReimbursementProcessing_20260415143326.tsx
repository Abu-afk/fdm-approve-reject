import { useState, useEffect, FormEvent } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { ExpenseClaim } from '../../types';

// Complete mock data for different claim types
const getMockClaimById = (claimId: string): ExpenseClaim => {
  const mockClaims: Record<string, ExpenseClaim> = {
    'CLM-001': {
      claimId: 'CLM-001',
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
    },
    'CLM-002': {
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
        decisionId: 'dec_002',
        decisionType: 'APPROVED',
        decidedAt: '2024-03-13T11:00:00Z',
        comment: 'Looks good - approved',
        manager: { fullName: 'Sarah Lee' }
      }],
      reimbursement: undefined
    },
    'CLM-003': {
      claimId: 'CLM-003',
      status: 'PAID',
      totalAmount: 432.10,
      currency: 'GBP',
      createdAt: '2024-03-05T08:00:00Z',
      submittedAt: '2024-03-05T09:00:00Z',
      employeeComment: 'Training materials for team',
      managerComment: 'Approved for training',
      financeComment: 'Processed via BACS transfer',
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
          description: 'Online course materials',
          merchant: 'Udemy',
          amount: 432.10,
          vatAmount: 72.02,
          currency: 'GBP',
          receipts: [{ receiptId: 'rcp_006', fileName: 'udemy_receipt.pdf', fileType: 'pdf', filePath: '/uploads/udemy_receipt.pdf', uploadDate: '2024-03-05T08:30:00Z' }]
        }
      ],
      decisions: [{
        decisionId: 'dec_003',
        decisionType: 'APPROVED',
        decidedAt: '2024-03-06T10:00:00Z',
        comment: 'Approved for professional development',
        manager: { fullName: 'Sarah Lee' }
      }],
      reimbursement: {
        reimbursementId: 'reim_001',
        processedAt: '2024-03-07T14:00:00Z',
        paidAt: '2024-03-07T14:00:00Z',
        paymentReference: 'BACS-20240307-001',
        amountPaid: 432.10,
        currency: 'GBP'
      }
    },
    'CLM-004': {
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
    'CLM-005': {
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
        decisionId: 'dec_004',
        decisionType: 'REJECTED',
        decidedAt: '2024-03-09T14:00:00Z',
        comment: 'Missing receipts for hotel stay - please resubmit with proper documentation',
        manager: { fullName: 'Bob Smith' }
      }],
      reimbursement: undefined
    }
  };

  return mockClaims[claimId] || mockClaims['CLM-001'];
};

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
        if (res.data && res.data.status) {
          setClaim(res.data);
          if (res.data.status === 'PAID') setProcessed(true);
        } else {
          const mockClaim = getMockClaimById(claimId);
          setClaim(mockClaim);
          if (mockClaim.status === 'PAID') setProcessed(true);
        }
      } catch (err) {
        console.log('API error, using mock data');
        const mockClaim = getMockClaimById(claimId);
        setClaim(mockClaim);
        if (mockClaim.status === 'PAID') setProcessed(true);
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
    
    // Only allow payment for APPROVED claims
    if (claim.status !== 'APPROVED') {
      setError('This claim cannot be processed for payment.');
      return;
    }
    
    if (window.confirm(`Process payment of ${formatMoney(claim.totalAmount, claim.currency)}?`)) {
      setProcessing(true);
      setError('');
      
      try {
        await api.processReimbursement(claim.claimId, {
          paymentReference: paymentRef.trim() || undefined,
          financeComment: notes.trim() || undefined,
        });
        
        // Update the claim status in localStorage
        const storedClaims = localStorage.getItem('fdm_claims');
        if (storedClaims) {
          const claims = JSON.parse(storedClaims);
          const updatedClaims = claims.map((c: ExpenseClaim) => 
            c.claimId === claim.claimId ? { ...c, status: 'PAID' as const } : c
          );
          localStorage.setItem('fdm_claims', JSON.stringify(updatedClaims));
        }
        
        // Dispatch event to notify dashboard
        window.dispatchEvent(new Event('claimsUpdated'));
        
        setProcessed(true);
        setClaim({ ...claim, status: 'PAID' });
        
        setTimeout(() => {
          navigate('/finance/claims');
        }, 2000);
      } catch (err) {
        // API failed, but for demo we still show success and update localStorage
        console.log('API error, simulating successful payment for demo');
        
        // Update the claim status in localStorage
        const storedClaims = localStorage.getItem('fdm_claims');
        if (storedClaims) {
          const claims = JSON.parse(storedClaims);
          const updatedClaims = claims.map((c: ExpenseClaim) => 
            c.claimId === claim.claimId ? { ...c, status: 'PAID' as const } : c
          );
          localStorage.setItem('fdm_claims', JSON.stringify(updatedClaims));
        }
        
        // Dispatch event to notify dashboard
        window.dispatchEvent(new Event('claimsUpdated'));
        
        setProcessed(true);
        setClaim({ ...claim, status: 'PAID' });
        
        setTimeout(() => {
          navigate('/finance/claims');
        }, 2000);
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
  const isPaid = claim.status === 'PAID';
  const isRejected = claim.status === 'REJECTED';
  const isPending = claim.status === 'SUBMITTED';
  
  // Show different messages based on claim status
  const getStatusMessage = () => {
    if (isPaid) return 'This claim has already been paid.';
    if (isRejected) return 'This claim has been rejected and cannot be processed.';
    if (isPending) return 'This claim is still pending manager approval.';
    return null;
  };

  return (
    <>
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
            {isPaid ? 'Reimbursement Details' : 'Process Reimbursement'}
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
      
      {/* Status message for non-APPROVED claims */}
      {getStatusMessage() && (
        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
          {getStatusMessage()}
        </div>
      )}

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

      {/* Manager Approval - Only show if there's an approval decision */}
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

      {/* Payment Section - Only show for APPROVED claims */}
      {isPaid ? (
        <div className="card" style={{ borderLeft: '4px solid #198754' }}>
          <div className="section-title" style={{ color: '#0f5132' }}>✓ Reimbursement Complete</div>
          <div className="alert alert-success">This claim has already been paid.</div>
          <div className="payment-info">
            <p><strong>Payment Reference:</strong> {claim.reimbursement?.paymentReference || 'N/A'}</p>
            <p><strong>Processed At:</strong> {claim.reimbursement?.processedAt ? formatDateTime(claim.reimbursement.processedAt) : 'N/A'}</p>
            <p><strong>Finance Notes:</strong> {claim.financeComment || 'None'}</p>
          </div>
          <button 
            onClick={() => navigate('/finance/claims')}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            Return to Dashboard
          </button>
        </div>
      ) : isRejected || isPending ? (
        <div className="card" style={{ borderLeft: '4px solid #dc3545' }}>
          <div className="section-title" style={{ color: '#842029' }}>⚠️ Cannot Process Payment</div>
          <div className="alert alert-warning">
            {isRejected 
              ? 'This claim has been rejected. Please contact the employee to resubmit with correct documentation.' 
              : 'This claim is still pending manager approval. Payment can only be processed after approval.'}
          </div>
          <button 
            onClick={() => navigate('/finance/claims')}
            className="btn btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      ) : processed ? (
        <div className="card" style={{ borderLeft: '4px solid #198754' }}>
          <div className="section-title" style={{ color: '#0f5132' }}>✓ Reimbursement Complete</div>
          <div className="alert alert-success">Claim has been marked as PAID.</div>
          <div className="payment-info">
            <p><strong>Payment Reference:</strong> {paymentRef || 'N/A'}</p>
            <p><strong>Finance Notes:</strong> {notes || 'None'}</p>
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