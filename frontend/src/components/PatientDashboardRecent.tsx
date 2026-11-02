import { Link } from 'react-router-dom';
import { Section, EmptyState, Badge } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam, Invoice } from '../types';

interface PatientDashboardRecentProps {
  exams: Exam[];
  invoices: Invoice[];
}

function examStatusTone(status: string) {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'primary';
}

function invoiceStatusTone(status: string) {
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'neutral';
  return 'danger';
}

export default function PatientDashboardRecent({ exams, invoices }: PatientDashboardRecentProps) {
  const recentExams = [...exams]
    .sort((a, b) => (a.scheduledDate < b.scheduledDate ? 1 : -1))
    .slice(0, 5);
  const recentInvoices = [...invoices].slice(0, 5);

  const hasActivity = recentExams.length > 0 || recentInvoices.length > 0;

  return (
    <Section eyebrow="Recent activity" title="Your latest exams and invoices">
      {!hasActivity ? (
        <EmptyState
          icon="calendar"
          title="No activity yet"
          text="Once an exam is booked for you, it will show up here alongside its invoice."
        />
      ) : (
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Details</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExams.map((exam) => (
                <tr key={`exam-${exam.id}`}>
                  <td>
                    <Icon name="package" size={16} title="Exam" />
                  </td>
                  <td>
                    <Link to={`/exams/${exam.id}`}>{exam.bodyPart} X-ray</Link>
                  </td>
                  <td>{exam.scheduledDate} {exam.scheduledTime}</td>
                  <td>
                    <Badge tone={examStatusTone(exam.status)}>{exam.status}</Badge>
                  </td>
                </tr>
              ))}
              {recentInvoices.map((invoice) => (
                <tr key={`invoice-${invoice.id}`}>
                  <td>
                    <Icon name="credit-card" size={16} title="Invoice" />
                  </td>
                  <td>
                    {invoice.examId ? (
                      <Link to={`/exams/${invoice.examId}`}>Invoice for exam #{invoice.examId}</Link>
                    ) : (
                      <span>Invoice #{invoice.id}</span>
                    )}
                  </td>
                  <td>${Number(invoice.amount).toFixed(2)}</td>
                  <td>
                    <Badge tone={invoiceStatusTone(invoice.status)}>{invoice.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}