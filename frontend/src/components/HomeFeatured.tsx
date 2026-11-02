import { Section, Grid, Card, CardBody, CardTitle, CardMeta, Media, Badge, SkeletonCards, EmptyState } from '../components/ui';
import type { Room } from '../types';

interface HomeFeaturedProps {
  rooms: Room[];
  loading?: boolean;
}

export default function HomeFeatured({ rooms, loading }: HomeFeaturedProps) {
  return (
    <Section
      eyebrow="Our facility"
      title="Imaging rooms"
      subtitle="Each exam is scheduled into one of our dedicated X-ray rooms, equipped and staffed for fast, accurate imaging."
    >
      {loading ? (
        <SkeletonCards count={6} />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon="home"
          title="No rooms available yet"
          text="Rooms will appear here once the clinic adds its imaging suites."
        />
      ) : (
        <Grid size="md" cols={3}>
          {rooms.slice(0, 8).map((room) => (
            <Card key={room.id}>
              <Media ratio="wide" alt={room.name} badge={room.roomNumber} />
              <CardBody>
                <CardTitle>{room.name}</CardTitle>
                <CardMeta>Room {room.roomNumber}</CardMeta>
                <Badge tone={room.isActive ? 'success' : 'neutral'}>
                  {room.isActive ? 'Available' : 'Unavailable'}
                </Badge>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </Section>
  );
}
