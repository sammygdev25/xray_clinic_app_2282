import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getExamList, getInvoiceList } from '../api';
import type { Exam, Invoice } from '../types';
import PatientDashboardHeader from '../components/PatientDashboardHeader';
import PatientDashboardStats from '../components/PatientDashboardStats';
import PatientDashboardRecent from '../components/PatientDashboardRecent';
import PatientDashboardActions from '../components/PatientDashboardActions';
import { LoadingBlock, Alert } from '../components/ui';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [examsError, setExamsError] = useState<string | null>(null);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    setLoadingExams(true);
    setExamsError(null);
    try {
      const data = await getExamList();
      setExams(data);
    } catch (err) {
      console.error(err);
      setExamsError('Could not load your exams right now.');
    } finally {
      setLoadingExams(false);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    setInvoicesError(null);
    try {
      const data = await getInvoiceList();
      setInvoices(data);
    } catch (err) {
      console.error(err);
      setInvoicesError('Could not load your invoices right now.');
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
    loadInvoices();
  }, [loadExams, loadInvoices]);

  const patientName = user ? `${user.first_name || user.username}` : 'there';

  return (
    <div className="ds-stack-lg">
      <PatientDashboardHeader
        patientName={patientName}
        onPrimaryAction={() => navigate('/staff/exams')}
      />

      {loadingExams || loadingInvoices ? (
        <LoadingBlock label="Loading your dashboard..." />
      ) : (
        <PatientDashboardStats exams={exams} invoices={invoices} />
      )}

      {examsError && <Alert tone="danger">{examsError}</Alert>}
      {invoicesError && <Alert tone="danger">{invoicesError}</Alert>}

      {!loadingExams && !loadingInvoices && (
        <PatientDashboardRecent exams={exams} invoices={invoices} />
      )}

      <PatientDashboardActions
        onViewExams={() => navigate('/staff/exams')}
        onViewInvoices={() => navigate('/staff/invoices')}
      />
    </div>
  );
}