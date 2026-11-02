import type { Exam, Invoice } from '../types';
import { Grid, Stat } from '../components/ui';

interface PatientDashboardStatsProps {
  exams: Exam[];
  invoices: Invoice[];
}

export default function PatientDashboardStats({ exams, invoices }: PatientDashboardStatsProps) {
  const upcomingCount = exams.filter((e) => e.status === 'scheduled').length;
  const completedCount = exams.filter((e) => e.status === 'completed').length;
  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid');
  const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <Grid size="sm" cols={4}>
      <Stat
        value={exams.length}
        label="Total X-ray exams"
        icon="package"
      />
      <Stat
        value={upcomingCount}
        label="Upcoming appointments"
        icon="calendar"
      />
      <Stat
        value={completedCount}
        label="Completed exams"
        icon="check"
      />
      <Stat
        value={`$${Number(unpaidTotal || 0).toFixed(2)}`}
        label={`Unpaid invoices (${unpaidInvoices.length})`}
        icon="credit-card"
      />
    </Grid>
  );
}