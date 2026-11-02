import type { Exam } from '../types';
import { Badge } from './ui';
import { Icon } from './icons';

interface ExamListProps {
  exams: Exam[];
  onSelectExam: (exam: Exam) => void;
}

const statusTone: Record<string, 'neutral' | 'success' | 'danger' | 'soft'> = {
  scheduled: 'soft',
  completed: 'success',
  cancelled: 'danger',
};

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  if (h === undefined) return time;
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m ?? '00'} ${period}`;
}

function ExamList({ exams, onSelectExam }: ExamListProps) {
  if (exams.length === 0) {
    return <p className="ds-muted">No exams scheduled yet.</p>;
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Body Part</th>
            <th>Room</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th aria-label="actions" />
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td>
                {exam.patient
                  ? `${exam.patient.firstName ?? ''} ${exam.patient.lastName ?? ''}`.trim() ||
                    exam.patient.username
                  : `Patient #${exam.patientId}`}
              </td>
              <td>{exam.bodyPart}</td>
              <td>{exam.room ? `${exam.room.name} (${exam.room.roomNumber})` : `Room #${exam.roomId}`}</td>
              <td>{exam.scheduledDate}</td>
              <td>{formatTime(exam.scheduledTime)}</td>
              <td>
                <Badge tone={statusTone[exam.status] ?? 'neutral'}>{exam.status}</Badge>
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onSelectExam(exam)}
                >
                  <Icon name="external" size={16} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExamList;
export { ExamList };