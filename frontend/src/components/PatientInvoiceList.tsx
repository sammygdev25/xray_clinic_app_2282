import type { Invoice } from '../types';
import { Badge, Price, EmptyState } from '../components/ui';

interface PatientInvoiceListProps {
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

function PatientInvoiceList({ invoices }: PatientInvoiceListProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No invoices yet"
        text="Invoices for your X-ray exams will appear here once they are issued."
      />
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Issued</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.exam?.bodyPart ?? `Exam #${invoice.examId}`}</td>
              <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
              <td>
                <Price value={Number(invoice.amount)} />
              </td>
              <td>
                <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientInvoiceList;
export { PatientInvoiceList };