import type { Room } from '../types';
import { Button, Badge } from './ui';
import { Icon } from './icons';

interface RoomListProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

function RoomList({ rooms, onEdit, onDelete }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="ds-empty">
        <Icon name="map-pin" size={28} />
        <p>No rooms have been set up yet.</p>
      </div>
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>Room</th>
            <th>Room Number</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.name}</td>
              <td>{room.roomNumber}</td>
              <td>
                <Badge tone={room.isActive ? 'success' : 'neutral'}>
                  {room.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td>
                <div className="ds-cluster">
                  <Button variant="ghost" size="md" onClick={() => onEdit(room)}>
                    <Icon name="edit" size={16} />
                    Edit
                  </Button>
                  <Button variant="danger" size="md" onClick={() => onDelete(room)}>
                    <Icon name="trash" size={16} />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoomList;
export { RoomList };