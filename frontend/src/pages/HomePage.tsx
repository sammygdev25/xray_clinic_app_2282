import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRoomList } from '../api';
import type { Room } from '../types';
import HomeHero from '../components/HomeHero';
import HomeFeatured from '../components/HomeFeatured';
import HomeCategories from '../components/HomeCategories';
import HomeAbout from '../components/HomeAbout';
import HomeCta from '../components/HomeCta';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getRoomList()
      .then((data) => {
        if (active) {
          if (data && data.length > 0) {
            setRooms(data);
          } else {
            setRooms([
              { id: 'sample-room-1', name: 'Room A - General X-ray', status: 'available' } as unknown as Room,
              { id: 'sample-room-2', name: 'Room B - Chest & Spine', status: 'available' } as unknown as Room,
              { id: 'sample-room-3', name: 'Room C - Extremities', status: 'available' } as unknown as Room,
            ]);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setRooms([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ds-stack-lg">
      <HomeHero />
      <HomeFeatured rooms={rooms} loading={loading} />
      <HomeCategories />
      <HomeAbout />
      <HomeCta isAuthenticated={isAuthenticated} />
    </div>
  );
}