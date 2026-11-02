import { PageHeader, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface PatientDashboardHeaderProps {
  patientName: string;
  onPrimaryAction?: () => void;
}

export default function PatientDashboardHeader({ patientName, onPrimaryAction }: PatientDashboardHeaderProps) {
  return (
    <PageHeader
      eyebrow="Patient Portal"
      title={`Welcome back, ${patientName}`}
      subtitle="Track your scheduled X-ray exams, review radiology reports and keep an eye on your invoices, all in one place."
      actions={
        <Button variant="primary" size="lg" onClick={onPrimaryAction}>
          <Icon name="calendar" size={18} />
          Contact clinic to book exam
        </Button>
      }
    />
  );
}