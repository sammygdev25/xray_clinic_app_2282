import { PageHeader } from '../components/ui';
import { Icon } from '../components/icons';

interface RadiologyWorklistHeaderProps {
  examCount?: number;
  loading?: boolean;
}

export default function RadiologyWorklistHeader({ examCount, loading }: RadiologyWorklistHeaderProps) {
  return (
    <PageHeader
      eyebrow="Radiology"
      title="Radiologist Worklist"
      subtitle="Review scheduled and completed X-ray exams, then author diagnostic reports."
      actions={
        !loading && typeof examCount === 'number' ? (
          <span className="ds-cluster" style={{ gap: '0.4rem', alignItems: 'center' }}>
            <Icon name="package" size={18} />
            <span className="ds-muted">
              {examCount} {examCount === 1 ? 'exam' : 'exams'} in queue
            </span>
          </span>
        ) : undefined
      }
    />
  );
}