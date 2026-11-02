import { Section, Split, Media, Badge, Button } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam } from '../types';

interface ExamDetailMediaProps {
  exam: Exam;
}

const STATUS_TONE: Record<string, 'neutral' | 'primary' | 'soft' | 'success' | 'danger'> = {
  scheduled: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

export default function ExamDetailMedia({ exam }: ExamDetailMediaProps) {
  const statusTone = STATUS_TONE[exam.status] ?? 'neutral';
  const scheduledLabel = `${exam.scheduledDate} at ${exam.scheduledTime}`;

  return (
    <Section tight>
      <Split>
        <Media
          alt={`${exam.bodyPart} X-ray exam`}
          ratio="wide"
          badge={<Badge tone={statusTone}>{exam.status}</Badge>}
        />
        <div className="ds-stack">
          <span className="ds-eyebrow">Exam #{exam.id}</span>
          <h1 className="ds-card-title">{exam.bodyPart} X-ray</h1>
          <p className="ds-card-meta">
            <Icon name="calendar" size={16} /> {scheduledLabel}
            {exam.room && (
              <>
                {' '}
                <Icon name="map-pin" size={16} /> {exam.room.name} (Room {exam.room.roomNumber})
              </>
            )}
          </p>
          <Badge tone={statusTone}>{exam.status}</Badge>
          <div className="ds-form-actions">
            <Button variant="primary" to="/dashboard">
              <Icon name="arrow-left" size={16} /> Back to dashboard
            </Button>
          </div>
        </div>
      </Split>
    </Section>
  );
}