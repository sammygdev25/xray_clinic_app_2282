import { Card, CardBody, CardTitle, CardMeta, Badge, Button, EmptyState, SkeletonCards } from '../components/ui';
import { Icon } from '../components/icons';
import type { Exam } from '../types';

interface StaffExamsContentProps {
  exams: Exam[];
  loading: boolean;
  onSelectExam: (exam: Exam) => void;
  onCancelExam?: (exam: Exam) => void;
  onCompleteExam?: (exam: Exam) => void;
}

function statusTone(status: string): 'neutral' | 'primary' | 'success' | 'danger' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'scheduled':
    default:
      return 'primary';
  }
}

export default function StaffExamsContent({
  exams,
  loading,
  onSelectExam,
  onCancelExam,
  onCompleteExam,
}: StaffExamsContentProps) {
  if (loading) {
    return <SkeletonCards count={6} />;
  }

  if (exams.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="No exams scheduled yet"
        text="Use the scheduling form to book a patient's X-ray exam into a room and time slot."
      />
    );
  }

  return (
    <div className="ds-grid ds-grid-md">
      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardBody>
            <div className="ds-between">
              <CardTitle>{exam.bodyPart}</CardTitle>
              <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
            </div>
            <CardMeta>
              <Icon name="user" size={14} /> {exam.patient?.firstName} {exam.patient?.lastName}
            </CardMeta>
            <CardMeta>
              <Icon name="map-pin" size={14} /> Room {exam.room?.roomNumber ?? exam.roomId}
            </CardMeta>
            <CardMeta>
              <Icon name="calendar" size={14} /> {exam.scheduledDate} at {exam.scheduledTime}
            </CardMeta>
            <div className="ds-cluster" style={{ marginTop: 'var(--space-sm, 12px)' }}>
              <Button variant="secondary" size="md" onClick={() => onSelectExam(exam)}>
                <Icon name="eye" size={16} /> View
              </Button>
              {exam.status === 'scheduled' && onCompleteExam && (
                <Button variant="primary" size="md" onClick={() => onCompleteExam(exam)}>
                  <Icon name="check" size={16} /> Mark completed
                </Button>
              )}
              {exam.status === 'scheduled' && onCancelExam && (
                <Button variant="danger" size="md" onClick={() => onCancelExam(exam)}>
                  <Icon name="close" size={16} /> Cancel
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}