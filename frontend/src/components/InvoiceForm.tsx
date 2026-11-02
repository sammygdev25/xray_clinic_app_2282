import { useState, useMemo } from 'react';
import { createInvoice } from '../api';
import { Alert } from '../components/ui';
import type { User, Exam, Invoice } from '../types';

interface InvoiceFormProps {
  patients: User[];
  exams: Exam[];
  onSubmit: (invoice: Invoice) => void;
}

function InvoiceForm({ patients, exams, onSubmit }: InvoiceFormProps) {
  const [patientId, setPatientId] = useState('');
  const [examId, setExamId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'unpaid' | 'paid' | 'cancelled'>('unpaid');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredExams = useMemo(() => {
    if (!patientId) return exams;
    return exams.filter((e) => e.patientId === Number(patientId));
  }, [exams, patientId]);

  const resetForm = () => {
    setPatientId('');
    setExamId('');
    setAmount('');
    setStatus('unpaid');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId || !examId || !amount) {
      setError('Select a patient, an exam, and enter an amount.');
      return;
    }
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      setError('Amount must be a valid non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const created = await createInvoice({
        patientId: Number(patientId),
        examId: Number(examId),
        amount: numericAmount,
        status,
        createdAt: now,
        updatedAt: now,
      });
      onSubmit(created);
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Could not create the invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ds-form" onSubmit={handleSubmit}>
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="invoice-patient">Patient</label>
          <select
            id="invoice-patient"
            className="input"
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setExamId('');
            }}
          >
            <option value="">Select a patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.username})
              </option>
            ))}
          </select>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="invoice-exam">Exam</label>
          <select
            id="invoice-exam"
            className="input"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
          >
            <option value="">Select an exam</option>
            {filteredExams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.bodyPart} — {ex.scheduledDate} {ex.scheduledTime}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="invoice-amount">Amount ($)</label>
          <input
            id="invoice-amount"
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 85.00"
          />
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="invoice-status">Status</label>
          <select
            id="invoice-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'unpaid' | 'paid' | 'cancelled')}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="ds-form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating invoice…' : 'Create invoice'}
        </button>
      </div>
    </form>
  );
}

export default InvoiceForm;
export { InvoiceForm };
