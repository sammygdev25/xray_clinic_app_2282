import { Card, CardBody, Badge, Button, EmptyState, SkeletonCards } from '../components/ui';
import { Icon } from '../components/icons';
import type { Invoice } from '../types';

interface StaffInvoicesContentProps {
  invoices: Invoice[];
  loading: boolean;
  canWrite: boolean;
  onMarkPaid: (id: number) => void;
  onMarkCancelled: (id: number) => void;
}

function statusTone(status: string): 'success' | 'danger' | 'neutral' {
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'neutral';
}

export default function StaffInvoicesContent({
  invoices,
  loading,
  canWrite,
  onMarkPaid,
  onMarkCancelled,
}: StaffInvoicesContentProps) {
  if (loading) {
    return <SkeletonCards count={4} />;
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No invoices yet"
        text="Invoices created for patient X-ray exams will appear here."
      />
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Exam</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                {canWrite && <th>Actions</th>}
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
                    {invoice.exam ? invoice.exam.bodyPart : `Exam #${invoice.examId}`}
                  </td>
                  <td>${Number(invoice.amount).toFixed(2)}</td>
                  <td>
                    <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
                  </td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  {canWrite && (
                    <td>
                      <div className="ds-cluster">
                        {invoice.status !== 'paid' && (
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => onMarkPaid(invoice.id)}
                          >
                            <Icon name="check" size={16} /> Mark paid
                          </Button>
                        )}
                        {invoice.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="md"
                            onClick={() => onMarkCancelled(invoice.id)}
                          >
                            <Icon name="close" size={16} /> Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}