import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardMeta, CardFooter, Badge, EmptyState, Stack } from './ui';
import { Icon } from './icons';
import type { Exam } from '../types';

interface PatientExamListProps {
  exams: Exam[];
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

function PatientExamList({ exams }: PatientExamListProps) {
  if (!exams || exams.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="No exams yet"
        text="Your scheduled and past X-ray exams will appear here once a receptionist books one for you."
      />
    );
  }

  return (
    <Stack gap="sm">
      {exams.map((exam) => (
        <Card key={exam.id} to={`/exams/${exam.id}`}>
          <CardBody>
            <Stack gap="xs">
              <div className="ds-between">
                <CardTitle>{exam.bodyPart} X-ray</CardTitle>
                <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
              </div>
              <CardMeta>
                <Icon name="calendar" size={14} /> {exam.scheduledDate} &middot;{' '}
                <Icon name="clock" size={14} /> {exam.scheduledTime}
              </CardMeta>
              {exam.room && (
                <CardMeta>
                  <Icon name="map-pin" size={14} /> {exam.room.name} (Room {exam.room.roomNumber})
                </CardMeta>
              )}
            </Stack>
            <CardFooter>
              <span className="ds-small ds-muted">
                View exam details <Icon name="arrow-right" size={14} />
              </span>
            </CardFooter>
          </CardBody>
        </Card>
      ))}
    </Stack>
  );
}

export default PatientExamList;
export { PatientExamList };