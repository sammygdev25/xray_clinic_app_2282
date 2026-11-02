import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getInvoiceList, getUserList, getExamList, updateInvoice } from '../api';
import { canWrite } from '../lib/roles';
import { Alert } from '../components/ui';
import StaffInvoicesHeader from '../components/StaffInvoicesHeader';
import StaffInvoicesContent from '../components/StaffInvoicesContent';
import InvoiceForm from '../components/InvoiceForm';
import type { Invoice, User, Exam } from '../types';

export default function StaffInvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInvoiceList();
      setInvoices(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not load invoices.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    try {
      const data = await getUserList({ role: 'patient' });
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadExams = useCallback(async () => {
    try {
      const data = await getExamList();
      setExams(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
    loadPatients();
    loadExams();
  }, [loadInvoices, loadPatients, loadExams]);

  const handleNewInvoice = () => setShowForm((prev) => !prev);

  const handleCreated = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
    setShowForm(false);
  };

  const handleMarkPaid = async (id: number) => {
    try {
      const updated = await updateInvoice(id, { status: 'paid' });
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
    } catch (err) {
      console.error(err);
      setError('Could not mark invoice as paid.');
    }
  };

  const handleMarkCancelled = async (id: number) => {
    try {
      const updated = await updateInvoice(id, { status: 'cancelled' });
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
    } catch (err) {
      console.error(err);
      setError('Could not cancel invoice.');
    }
  };

  const allowWrite = canWrite(user?.role, 'Invoice');

  return (
    <div className="ds-stack-lg">
      <StaffInvoicesHeader
        onNewInvoice={allowWrite ? handleNewInvoice : undefined}
        invoiceCount={invoices.length}
      />
      {error && <Alert tone="danger">{error}</Alert>}
      {allowWrite && showForm && (
        <InvoiceForm patients={patients} exams={exams} onSubmit={handleCreated} />
      )}
      <StaffInvoicesContent
        invoices={invoices}
        loading={loading}
        canWrite={allowWrite}
        onMarkPaid={handleMarkPaid}
        onMarkCancelled={handleMarkCancelled}
      />
    </div>
  );
}
