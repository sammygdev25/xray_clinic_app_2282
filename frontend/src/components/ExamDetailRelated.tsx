import { Section, Grid, Card, CardBody, CardTitle, CardMeta } from '../components/ui';
import { Icon } from '../components/icons';
import type { Room } from '../types';

interface ExamDetailRelatedProps {
  rooms: Room[];
  currentRoomId?: number;
}

export default function ExamDetailRelated({ rooms, currentRoomId }: ExamDetailRelatedProps) {
  const related = rooms
    .filter((room) => room.id !== currentRoomId)
    .slice(0, 6);

  if (related.length === 0) {
    return null;
  }

  return (
    <Section
      eyebrow="Clinic rooms"
      title="Other imaging rooms"
      subtitle="These rooms are also equipped for X-ray exams at the clinic."
    >
      <Grid size="sm">
        {related.map((room) => (
          <Card key={room.id}>
            <CardBody>
              <CardTitle>{room.name}</CardTitle>
              <CardMeta>
                <Icon name="map-pin" size={14} /> Room {room.roomNumber}
              </CardMeta>
              <CardMeta>
                <Icon name={room.isActive ? 'check' : 'alert'} size={14} />{' '}
                {room.isActive ? 'Available for scheduling' : 'Currently inactive'}
              </CardMeta>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}