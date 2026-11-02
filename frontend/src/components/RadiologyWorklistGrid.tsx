import type { Exam } from '../types';
import { Grid, Card, CardBody, CardTitle, CardMeta, CardFooter, Badge, Button, SkeletonCards, EmptyState } from '../components/ui';
import { Icon } from '../components/icons';

interface RadiologyWorklistGridProps {
  exams: Exam[];
  loading?: boolean;
  onSelectExam: (exam: Exam) => void;
}

function statusTone(status: string): 'neutral' | 'primary' | 'soft' | 'success' | 'danger' {
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

export default function RadiologyWorklistGrid({ exams, loading, onSelectExam }: RadiologyWorklistGridProps) {
  if (loading) {
    return <SkeletonCards count={6} />;
  }

  if (exams.length === 0) {
    return (
      <EmptyState
        icon="image"
        title="No exams in the worklist"
        text="There are no X-ray exams matching the current filters right now."
      />
    );
  }

  return (
    <Grid size="md" cols={3}>
      {exams.map((exam) => {
        const hasReport = !!exam.reports;
        return (
          <Card key={exam.id} onClick={() => onSelectExam(exam)}>
            <CardBody>
              <CardTitle>{exam.bodyPart} X-ray</CardTitle>
              <CardMeta>
                Patient: {exam.patient ? `${exam.patient.firstName} ${exam.patient.lastName}` : `#${exam.patientId}`}
              </CardMeta>
              <CardMeta>
                Room: {exam.room ? `${exam.room.name} (${exam.room.roomNumber})` : `#${exam.roomId}`}
              </CardMeta>
              <CardMeta>
                {exam.scheduledDate} at {exam.scheduledTime}
              </CardMeta>
              <div className="ds-cluster">
                <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
                <Badge tone={hasReport ? 'success' : 'neutral'}>
                  {hasReport ? 'Reported' : 'Awaiting report'}
                </Badge>
              </div>
              <CardFooter>
                <Button variant={hasReport ? 'secondary' : 'primary'} size="md" onClick={() => onSelectExam(exam)}>
                  <Icon name="edit" size={16} />
                  {hasReport ? 'View / edit report' : 'Write report'}
                </Button>
              </CardFooter>
            </CardBody>
          </Card>
        );
      })}
    </Grid>
  );
}