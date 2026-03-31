import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const CURRENCIES = ['GBP', 'USD', 'EUR', 'CHF', 'JPY', 'AUD', 'CAD'];

export default function NewClaim() {
  const [currency, setCurrency] = useState('GBP');
  const [employeeComment, setEmployeeComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.createClaim({ currency, employeeComment: employeeComment || undefined });
      navigate(`/employee/claims/${res.data.claimId}/edit`);
    } catch {
      setError('Failed to create claim. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="page-title">New Expense Claim</h1>

      <div className="card" style={{ maxWidth: '520px' }}>
        <p className="text-muted" style={{ marginBottom: '20px' }}>
          Start by setting the claim currency and an optional note. You'll add expense items and receipts on the next screen.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Currency *</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={employeeComment}
              onChange={(e) => setEmployeeComment(e.target.value)}
              rows={3}
              placeholder="e.g. Client visit to Manchester, project code ABC-123"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create & Add Items →'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/employee/claims')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
