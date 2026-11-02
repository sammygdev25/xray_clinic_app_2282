import { PageHeader, Button } from '../components/ui';
import { Icon } from '../components/icons';

interface StaffExamsHeaderProps {
  examCount?: number;
  onScheduleClick?: () => void;
}

export default function StaffExamsHeader({ examCount, onScheduleClick }: StaffExamsHeaderProps) {
  return (
    <PageHeader
      eyebrow="Reception desk"
      title="Exam scheduling"
      subtitle={
        typeof examCount === 'number'
          ? `${examCount} X-ray exam${examCount === 1 ? '' : 's'} on the books — book new exams and keep the radiology schedule up to date.`
          : 'Book new X-ray exams, assign rooms and keep the radiology schedule up to date.'
      }
      actions={
        onScheduleClick ? (
          <Button variant="primary" onClick={onScheduleClick}>
            <Icon name="plus" size={16} />
            Schedule exam
          </Button>
        ) : undefined
      }
    />
  );
}