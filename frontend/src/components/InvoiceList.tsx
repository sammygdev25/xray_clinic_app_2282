import type { Invoice } from '../types';
import { Badge, EmptyState, Price } from './ui';
import { Icon } from './icons';

interface InvoiceListProps {
  invoices: Invoice[];
}

function statusTone(status: string): 'neutral' | 'primary' | 'soft' | 'success' | 'danger' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'unpaid':
    default:
      return 'soft';
  }
}

function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No invoices yet"
        text="Invoices created for patient exams will appear here."
      />
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Exam</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                {invoice.patient
                  ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                  : `Patient #${invoice.patientId}`}
              </td>
              <td>
                {invoice.exam ? (
                  <span className="ds-cluster" style={{ gap: '0.35rem' }}>
                    <Icon name="image" size={16} />
                    {invoice.exam.bodyPart}
                  </span>
                ) : (
                  `Exam #${invoice.examId}`
                )}
              </td>
              <td>
                <Price value={Number(invoice.amount)} />
              </td>
              <td>
                <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
              </td>
              <td className="ds-muted ds-small">
                {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceList;
export { InvoiceList };