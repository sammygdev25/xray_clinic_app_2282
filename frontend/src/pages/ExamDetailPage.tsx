import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getExam, getRoomList } from '../api';
import type { Exam, Room } from '../types';
import ExamDetailMedia from '../components/ExamDetailMedia';
import ExamDetailFacts from '../components/ExamDetailFacts';
import ExamDetailRelated from '../components/ExamDetailRelated';
import ReportView from '../components/ReportView';
import { ExamInfoCard } from '../components/ExamInfoCard';
import { Section, LoadingBlock, EmptyState } from '../components/ui';

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadExam() {
      setLoading(true);
      setError('');
      try {
        const data = await getExam(Number(id));
        if (active) setExam(data);
      } catch (err) {
        if (active) setError('We could not load this exam. It may no longer be available.');
      } finally {
        if (active) setLoading(false);
      }
    }

    async function loadRooms() {
      try {
        const data = await getRoomList();
        if (active) setRooms(data);
      } catch (err) {
        if (active) setRooms([]);
      }
    }

    loadExam();
    loadRooms();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <LoadingBlock label="Loading exam details..." />;
  }

  if (error || !exam) {
    return (
      <EmptyState
        icon="alert"
        title="Exam not found"
        text={error || "We couldn't find the exam you are looking for."}
      />
    );
  }

  const currentRoomId = exam.room?.id ?? exam.roomId;
  const firstReport = exam.reports && exam.reports.length > 0 ? exam.reports[0] : null;

  return (
    <div className="ds-stack-lg">
      <ExamDetailMedia exam={exam} />

      <Section eyebrow="Exam summary" title="At a glance" narrow>
        <ExamInfoCard exam={exam} />
      </Section>

      {firstReport && (
        <Section eyebrow="Radiology report" title="Your report" narrow>
          <ReportView report={firstReport} />
        </Section>
      )}

      <ExamDetailFacts exam={exam} />

      <ExamDetailRelated rooms={rooms} currentRoomId={currentRoomId} />
    </div>
  );
}
