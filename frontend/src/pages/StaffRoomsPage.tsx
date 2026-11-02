import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { canWrite as canWriteRole } from '../lib/roles';
import { getRoomList, createRoom, updateRoom, deleteRoom } from '../api';
import type { Room } from '../types';
import StaffRoomsHeader from '../components/StaffRoomsHeader';
import StaffRoomsContent from '../components/StaffRoomsContent';
import RoomForm from '../components/RoomForm';
import { Alert } from '../components/ui';

export default function StaffRoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formError, setFormError] = useState('');

  const userCanWrite = canWriteRole(user?.role, 'Room');

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRoomList();
      setRooms(data);
    } catch (err) {
      setError('Could not load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleAddRoom = () => {
    setEditingRoom(null);
    setFormError('');
    setShowForm(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormError('');
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRoom(null);
    setFormError('');
  };

  const handleSubmit = async (data: { name: string; roomNumber: string; isActive: boolean }) => {
    setFormError('');
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, data);
      } else {
        const now = new Date().toISOString();
        await createRoom({ ...data, createdAt: now, updatedAt: now });
      }
      setShowForm(false);
      setEditingRoom(null);
      await loadRooms();
    } catch (err) {
      setFormError('Could not save the room. Check the room number is unique and try again.');
    }
  };

  const handleDelete = async (room: Room) => {
    if (!window.confirm(`Remove room ${room.name} (${room.roomNumber})?`)) return;
    try {
      await deleteRoom(room.id);
      await loadRooms();
    } catch (err) {
      setError('Could not delete the room. It may have exams scheduled.');
    }
  };

  return (
    <div className="ds-stack-lg">
      <StaffRoomsHeader onAddRoom={handleAddRoom} canAddRoom={userCanWrite} />

      {showForm && userCanWrite && (
        <div className="ds-card ds-card-body">
          {formError && <Alert tone="danger">{formError}</Alert>}
          <RoomForm room={editingRoom} onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      )}

      <StaffRoomsContent
        rooms={rooms}
        loading={loading}
        error={error}
        canWrite={userCanWrite}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
