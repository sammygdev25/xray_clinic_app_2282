import { PageHeader, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface StaffInvoicesHeaderProps {
  onNewInvoice?: () => void;
  invoiceCount?: number;
}

export default function StaffInvoicesHeader({ onNewInvoice, invoiceCount }: StaffInvoicesHeaderProps) {
  return (
    <PageHeader
      eyebrow="Billing"
      title="Patient Invoices"
      subtitle="Create and manage invoices for completed and scheduled X-ray exams."
      actions={
        onNewInvoice ? (
          <Button variant="primary" onClick={onNewInvoice}>
            <Icon name="plus" size={16} />
            New Invoice
          </Button>
        ) : invoiceCount !== undefined ? (
          <span className="ds-muted ds-small">
            {invoiceCount} {invoiceCount === 1 ? 'invoice' : 'invoices'} on file
          </span>
        ) : undefined
      }
    />
  );
}