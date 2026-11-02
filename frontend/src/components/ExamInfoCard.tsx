import type { Exam } from '../types';
import { Card, CardBody, CardTitle, CardMeta, Badge } from './ui';
import { Icon } from './icons';

interface ExamInfoCardProps {
  exam: Exam;
}

function statusTone(status: string): 'neutral' | 'primary' | 'success' | 'danger' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'scheduled':
      return 'primary';
    default:
      return 'neutral';
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = Number(h);
  if (Number.isNaN(hour)) return timeStr;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m ?? '00'} ${period}`;
}

export function ExamInfoCard({ exam }: ExamInfoCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="ds-between">
          <CardTitle>{exam.bodyPart} X-ray</CardTitle>
          <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
        </div>
        <CardMeta>
          <span className="ds-cluster">
            <Icon name="calendar" size={16} />
            {formatDate(exam.scheduledDate)}
          </span>
        </CardMeta>
        <CardMeta>
          <span className="ds-cluster">
            <Icon name="clock" size={16} />
            {formatTime(exam.scheduledTime)}
          </span>
        </CardMeta>
        {exam.room && (
          <CardMeta>
            <span className="ds-cluster">
              <Icon name="map-pin" size={16} />
              {exam.room.name} (Room {exam.room.roomNumber})
            </span>
          </CardMeta>
        )}
        {exam.patient && (
          <CardMeta>
            <span className="ds-cluster">
              <Icon name="user" size={16} />
              {exam.patient.firstName} {exam.patient.lastName}
            </span>
          </CardMeta>
        )}
      </CardBody>
    </Card>
  );
}

export default ExamInfoCard;