import { PageHeader, Button } from '../components/ui';

interface StaffRoomsHeaderProps {
  onAddRoom?: () => void;
  canAddRoom?: boolean;
}

export default function StaffRoomsHeader({ onAddRoom, canAddRoom }: StaffRoomsHeaderProps) {
  return (
    <PageHeader
      eyebrow="Room management"
      title="X-ray Rooms"
      subtitle="Manage the imaging rooms available for scheduling patient exams, keep them active or retire them as needed."
      actions={
        canAddRoom ? (
          <Button variant="primary" onClick={onAddRoom}>
            Add room
          </Button>
        ) : undefined
      }
    />
  );
}