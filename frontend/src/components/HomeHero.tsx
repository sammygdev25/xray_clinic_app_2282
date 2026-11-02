import { Hero, Button, Media } from '../components/ui';
import { Icon } from '../components/icons';

export interface HomeHeroProps {
  eyebrow?: string;
  title?: string;
  text?: string;
  imageSrc?: string;
}

export default function HomeHero({
  eyebrow = 'Riverside Imaging Center',
  title = 'X-ray care, scheduled and read without the back-and-forth',
  text = 'Patients book exams and track reports from one dashboard, while receptionists and radiologists manage rooms, worklists and invoices in real time. One clinic, one clear record for every scan.',
  imageSrc,
}: HomeHeroProps) {
  return (
    <Hero
      eyebrow={eyebrow}
      title={title}
      text={text}
      actions={
        <>
          <Button variant="primary" size="lg" to="/dashboard">
            Go to my dashboard
            <Icon name="arrow-right" size={18} />
          </Button>
          <Button variant="ghost" size="lg" to="/register">
            Create an account
          </Button>
        </>
      }
      media={
        imageSrc ? (
          <Media src={imageSrc} alt="Radiology room with X-ray equipment" ratio="wide" />
        ) : undefined
      }
    />
  );
}