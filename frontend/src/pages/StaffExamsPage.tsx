import { useCallback, useEffect, useState } from 'react';
import { api, getExamList, getUserList, getRoomList } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { Exam, Room, User } from '../types';
import { Alert } from '../components/ui';
import StaffExamsHeader from '../components/StaffExamsHeader';
import StaffExamsContent from '../components/StaffExamsContent';
import ExamScheduleForm from '../components/ExamScheduleForm';

export default function StaffExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExamList();
      setExams(data);
    } catch (err) {
      console.error(err);
      setError('Could not load the exam schedule.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
    getUserList({ role: 'patient' } as any)
      .then(setPatients)
      .catch((err) => console.error(err));
    getRoomList()
      .then(setRooms)
      .catch((err) => console.error(err));
  }, [loadExams]);

  const handleSelectExam = (exam: Exam) => {
    window.location.href = `/exams/${exam.id}`;
  };

  const handleScheduleSubmit = async (data: {
    patientId: number;
    bodyPart: string;
    roomId: number;
    scheduledDate: string;
    scheduledTime: string;
  }) => {
    try {
      await api.post('/scheduling/exams/', {
        patientId: data.patientId,
        bodyPart: data.bodyPart,
        roomId: data.roomId,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
      });
      setShowForm(false);
      await loadExams();
    } catch (err) {
      console.error(err);
      setError('Could not schedule the exam. Check the details and try again.');
    }
  };

  const handleCancelExam = async (exam: Exam) => {
    try {
      await api.put(`/scheduling/exams/${exam.id}/`, { status: 'cancelled' });
      await loadExams();
    } catch (err) {
      console.error(err);
      setError('Could not cancel the exam.');
    }
  };

  const handleCompleteExam = async (exam: Exam) => {
    try {
      await api.put(`/scheduling/exams/${exam.id}/`, { status: 'completed' });
      await loadExams();
    } catch (err) {
      console.error(err);
      setError('Could not mark the exam as completed.');
    }
  };

  return (
    <div className="ds-stack-lg">
      <StaffExamsHeader
        examCount={exams.length}
        onScheduleClick={() => setShowForm((prev) => !prev)}
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {showForm && user?.role === 'receptionist' && (
        <ExamScheduleForm
          patients={patients}
          rooms={rooms}
          onSubmit={handleScheduleSubmit}
        />
      )}

      <StaffExamsContent
        exams={exams}
        loading={loading}
        onSelectExam={handleSelectExam}
        onCancelExam={handleCancelExam}
        onCompleteExam={handleCompleteExam}
      />
    </div>
  );
}