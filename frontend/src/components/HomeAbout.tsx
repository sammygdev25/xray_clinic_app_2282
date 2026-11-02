import { Section, Split, Card, CardBody, CardTitle } from '../components/ui';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';

interface ValuePoint {
  icon: IconName;
  title: string;
  text: string;
}

interface HomeAboutProps {
  heading?: string;
  story?: string[];
  values?: ValuePoint[];
}

const defaultStory = [
  'Riverside X-Ray Clinic was founded to make diagnostic imaging fast, accurate and stress-free. Patients book a scan, receptionists coordinate rooms and schedules, and our radiologists turn exams into reports without the usual back-and-forth.',
  'Every exam moves through one system: a patient requests imaging, the front desk assigns a room and time, the scan is performed, and a radiologist reads the images and files a report the patient can see from their dashboard.',
];

const defaultValues: ValuePoint[] = [
  {
    icon: 'clock',
    title: 'Fast turnaround',
    text: 'Exams are scheduled within days and reports are typically ready within 24 hours of the scan.',
  },
  {
    icon: 'shield',
    title: 'Accurate reads',
    text: 'Every image is reviewed by a licensed radiologist before a report reaches the patient record.',
  },
  {
    icon: 'users',
    title: 'Coordinated care',
    text: 'Receptionists, radiologists and patients share one worklist, so nothing slips between departments.',
  },
];

export default function HomeAbout({
  heading = 'About our clinic',
  story = defaultStory,
  values = defaultValues,
}: HomeAboutProps) {
  return (
    <Section eyebrow="Who we are" title={heading}>
      <Split>
        <div className="ds-stack">
          {story.map((paragraph, idx) => (
            <p key={idx} className="ds-lead">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="ds-stack">
          {values.map((value) => (
            <Card key={value.title}>
              <CardBody>
                <Icon name={value.icon} size={24} />
                <CardTitle>{value.title}</CardTitle>
                <p className="ds-muted">{value.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Split>
    </Section>
  );
}