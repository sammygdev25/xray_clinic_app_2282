import { Section, Grid, Badge } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam } from '../types';

interface ExamDetailFactsProps {
  exam: Exam;
}

function statusTone(status: string): 'neutral' | 'primary' | 'success' | 'danger' {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'primary';
}

export default function ExamDetailFacts({ exam }: ExamDetailFactsProps) {
  const room = exam.room;

  return (
    <Section eyebrow="Details" title="Exam information">
      <Grid cols={2} size="sm">
        <div className="ds-card ds-card-body">
          <div className="ds-cluster">
            <Icon name="package" size={18} />
            <span className="ds-label">Body part</span>
          </div>
          <p>{exam.bodyPart}</p>
        </div>

        <div className="ds-card ds-card-body">
          <div className="ds-cluster">
            <Icon name="info" size={18} />
            <span className="ds-label">Status</span>
          </div>
          <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
        </div>

        <div className="ds-card ds-card-body">
          <div className="ds-cluster">
            <Icon name="calendar" size={18} />
            <span className="ds-label">Scheduled date</span>
          </div>
          <p>{exam.scheduledDate}</p>
        </div>

        <div className="ds-card ds-card-body">
          <div className="ds-cluster">
            <Icon name="clock" size={18} />
            <span className="ds-label">Scheduled time</span>
          </div>
          <p>{exam.scheduledTime}</p>
        </div>

        <div className="ds-card ds-card-body">
          <div className="ds-cluster">
            <Icon name="map-pin" size={18} />
            <span className="ds-label">Room</span>
          </div>
          <p>{room ? `${room.name} (#${room.roomNumber})` : `Room #${exam.roomId}`}</p>
        </div>

        {room && (
          <div className="ds-card ds-card-body">
            <div className="ds-cluster">
              <Icon name="shield" size={18} />
              <span className="ds-label">Room availability</span>
            </div>
            <Badge tone={room.isActive ? 'success' : 'neutral'}>
              {room.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )}
      </Grid>
    </Section>
  );
}