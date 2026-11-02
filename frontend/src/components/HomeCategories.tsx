import { Section, Grid, Card, CardBody, CardTitle, CardMeta } from '../components/ui';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';

interface Step {
  icon: IconName;
  title: string;
  text: string;
}

interface HomeCategoriesProps {
  steps?: Step[];
}

const DEFAULT_STEPS: Step[] = [
  {
    icon: 'calendar',
    title: 'Book your exam',
    text: 'Patients schedule an X-ray appointment and pick a body part and preferred time, no clinic visit needed to get started.',
  },
  {
    icon: 'image',
    title: 'Imaging in the room',
    text: 'Our receptionists assign a room and our radiographers capture the scan, then the exam status updates in your dashboard.',
  },
  {
    icon: 'clipboard' as IconName,
    title: 'Radiologist report',
    text: 'A radiologist reviews the images and publishes a report; your invoice and results appear together on your dashboard.',
  },
];

export default function HomeCategories({ steps = DEFAULT_STEPS }: HomeCategoriesProps) {
  return (
    <Section
      eyebrow="How it works"
      title="From booking to report, in three steps"
      subtitle="A clear path for patients, receptionists and radiologists working from the same exam record."
    >
      <Grid size="sm" cols={3}>
        {steps.map((step) => (
          <Card key={step.title}>
            <CardBody>
              <Icon name={step.icon} size={28} title={step.title} />
              <CardTitle>{step.title}</CardTitle>
              <CardMeta>{step.text}</CardMeta>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}