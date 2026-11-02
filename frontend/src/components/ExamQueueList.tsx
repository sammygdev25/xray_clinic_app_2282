import type { Exam } from '../types';
import { Badge, Stack, EmptyState } from '../components/ui';
import { Icon } from '../components/icons';

interface ExamQueueListProps {
  exams: Exam[];
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

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${suffix}`;
}

export function ExamQueueList({ exams, onSelectExam }: ExamQueueListProps) {
  if (exams.length === 0) {
    return (
      <EmptyState
        icon="image"
        title="No exams in the queue"
        text="There are no X-ray exams waiting for a report right now."
      />
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Body part</th>
            <th>Room</th>
            <th>Scheduled</th>
            <th>Status</th>
            <th>Report</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => {
            const patientName = exam.patient
              ? `${exam.patient.firstName} ${exam.patient.lastName}`
              : `Patient #${exam.patientId}`;
            const hasReport = Boolean(exam.reports);
            return (
              <tr
                key={exam.id}
                onClick={() => onSelectExam(exam)}
                style={{ cursor: 'pointer' }}
              >
                <td>{patientName}</td>
                <td>{exam.bodyPart}</td>
                <td>{exam.room ? `${exam.room.name} (${exam.room.roomNumber})` : `Room #${exam.roomId}`}</td>
                <td>
                  <Stack gap="xs">
                    <span className="ds-cluster">
                      <Icon name="calendar" size={14} /> {exam.scheduledDate}
                    </span>
                    <span className="ds-cluster ds-small ds-muted">
                      <Icon name="clock" size={14} /> {formatTime(exam.scheduledTime)}
                    </span>
                  </Stack>
                </td>
                <td>
                  <Badge tone={statusTone(exam.status)}>{exam.status}</Badge>
                </td>
                <td>
                  {hasReport ? (
                    <Badge tone="success">Reported</Badge>
                  ) : (
                    <Badge tone="neutral">Pending</Badge>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExam(exam);
                    }}
                  >
                    {hasReport ? 'View report' : 'Write report'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ExamQueueList;