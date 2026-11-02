import { Section, Cluster, Button } from '../components/ui';
import { Icon } from '../components/icons';

export interface PatientDashboardActionsProps {
  onViewExams?: () => void;
  onViewInvoices?: () => void;
}

export default function PatientDashboardActions({ onViewExams, onViewInvoices }: PatientDashboardActionsProps) {
  return (
    <Section tight title="Quick actions">
      <Cluster gap="sm">
        <Button variant="primary" onClick={onViewExams}>
          <Icon name="calendar" size={16} />
          View my exams
        </Button>
        <Button variant="secondary" onClick={onViewInvoices}>
          <Icon name="credit-card" size={16} />
          View my invoices
        </Button>
        <Button variant="secondary" to="/profile">
          <Icon name="user" size={16} />
          Update profile
        </Button>
        <Button variant="ghost" to="/">
          <Icon name="home" size={16} />
          Back to home
        </Button>
      </Cluster>
    </Section>
  );
}