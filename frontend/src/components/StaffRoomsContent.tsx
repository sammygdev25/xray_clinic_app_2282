import { Card, CardBody, CardTitle, CardMeta, CardFooter, Button, Grid, EmptyState, SkeletonCards, Alert, Badge } from '../components/ui';
import { Icon } from '../components/icons';
import type { Room } from '../types';

interface StaffRoomsContentProps {
  rooms: Room[];
  loading: boolean;
  error: string;
  canWrite: boolean;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

export default function StaffRoomsContent({ rooms, loading, error, canWrite, onEdit, onDelete }: StaffRoomsContentProps) {
  if (loading) {
    return <SkeletonCards count={6} />;
  }

  if (error) {
    return <Alert tone="danger">{error}</Alert>;
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        icon="map-pin"
        title="No X-ray rooms yet"
        text="Add the clinic's imaging rooms so exams can be scheduled into them."
      />
    );
  }

  return (
    <Grid size="sm" cols={3}>
      {rooms.map((room) => (
        <Card key={room.id}>
          <CardBody>
            <CardTitle>{room.name}</CardTitle>
            <CardMeta>
              <span className="ds-cluster">
                <Icon name="map-pin" size={14} /> Room {room.roomNumber}
              </span>
            </CardMeta>
            <Badge tone={room.isActive ? 'success' : 'neutral'}>
              {room.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardBody>
          {canWrite && (
            <CardFooter>
              <Button variant="ghost" size="md" onClick={() => onEdit(room)}>
                <Icon name="edit" size={16} /> Edit
              </Button>
              <Button variant="danger" size="md" onClick={() => onDelete(room)}>
                <Icon name="trash" size={16} /> Delete
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </Grid>
  );
}