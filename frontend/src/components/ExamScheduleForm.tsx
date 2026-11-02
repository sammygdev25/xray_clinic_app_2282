import { useState, FormEvent } from 'react';
import { Button } from './ui';
import type { User, Room } from '../types';

interface ExamScheduleFormProps {
  patients: User[];
  rooms: Room[];
  onSubmit: (data: {
    patientId: number;
    bodyPart: string;
    roomId: number;
    scheduledDate: string;
    scheduledTime: string;
  }) => void | Promise<void>;
}

const BODY_PARTS = [
  'Chest',
  'Abdomen',
  'Spine',
  'Skull',
  'Hand',
  'Wrist',
  'Foot',
  'Ankle',
  'Knee',
  'Shoulder',
  'Pelvis',
];

function ExamScheduleForm({ patients, rooms, onSubmit }: ExamScheduleFormProps) {
  const [patientId, setPatientId] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [roomId, setRoomId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const activeRooms = rooms.filter((r) => r.isActive !== false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId || !bodyPart || !roomId || !scheduledDate || !scheduledTime) {
      setError('Please fill in all fields to schedule the X-ray.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        patientId: Number(patientId),
        bodyPart,
        roomId: Number(roomId),
        scheduledDate,
        scheduledTime,
      });
      setPatientId('');
      setBodyPart('');
      setRoomId('');
      setScheduledDate('');
      setScheduledTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not schedule the exam.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ds-form" onSubmit={handleSubmit}>
      {error && <div className="ds-alert" role="alert">{error}</div>}

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-patient">Patient</label>
          <select
            id="exam-patient"
            className="input"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          >
            <option value="">Select a patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.username})
              </option>
            ))}
          </select>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-body-part">Body part</label>
          <select
            id="exam-body-part"
            className="input"
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
          >
            <option value="">Select body part</option>
            {BODY_PARTS.map((part) => (
              <option key={part} value={part}>{part}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ds-form-row">
        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-room">Room</label>
          <select
            id="exam-room"
            className="input"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            <option value="">Select a room</option>
            {activeRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.roomNumber})
              </option>
            ))}
          </select>
          {activeRooms.length === 0 && (
            <div className="ds-help">No active rooms available. Add one in Rooms.</div>
          )}
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-date">Date</label>
          <input
            id="exam-date"
            type="date"
            className="input"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="exam-time">Time</label>
          <input
            id="exam-time"
            type="time"
            className="input"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        </div>
      </div>

      <div className="ds-form-actions">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Scheduling…' : 'Schedule X-ray'}
        </Button>
      </div>
    </form>
  );
}

export default ExamScheduleForm;
export { ExamScheduleForm };