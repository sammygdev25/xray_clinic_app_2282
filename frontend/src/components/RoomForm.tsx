import { useState, useEffect, FormEvent } from 'react';
import type { Room } from '../types';
import { Button } from './ui';

interface RoomFormProps {
  room?: Room | null;
  onSubmit: (data: { name: string; roomNumber: string; isActive: boolean }) => void;
  onCancel: () => void;
}

function RoomForm({ room, onSubmit, onCancel }: RoomFormProps) {
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (room) {
      setName(room.name);
      setRoomNumber(room.roomNumber);
      setIsActive(room.isActive);
    } else {
      setName('');
      setRoomNumber('');
      setIsActive(true);
    }
  }, [room]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomNumber.trim()) return;
    onSubmit({ name: name.trim(), roomNumber: roomNumber.trim(), isActive });
  };

  return (
    <form className="ds-form" onSubmit={handleSubmit}>
      <div className="ds-field">
        <label className="ds-label" htmlFor="room-name">
          Room name
        </label>
        <input
          id="room-name"
          className="input"
          type="text"
          placeholder="e.g. X-Ray Suite A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="room-number">
          Room number
        </label>
        <input
          id="room-number"
          className="input"
          type="text"
          placeholder="e.g. 101"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          required
        />
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="room-active">
          <input
            id="room-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Room is active
        </label>
        <p className="ds-help">Inactive rooms cannot be selected when scheduling a new exam.</p>
      </div>

      <div className="ds-form-actions">
        <Button type="submit" variant="primary">
          {room ? 'Update room' : 'Add room'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default RoomForm;
export { RoomForm };