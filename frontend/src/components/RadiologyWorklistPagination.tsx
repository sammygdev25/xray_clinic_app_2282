import { Button } from '../components/ui';
import { Icon } from '../components/icons';

interface RadiologyWorklistPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function RadiologyWorklistPagination({
  currentPage,
  totalPages,
  onPageChange,
}: RadiologyWorklistPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="ds-pagination">
      <Button
        variant="ghost"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <Icon name="chevron-left" size={16} />
        Previous
      </Button>
      <span className="ds-muted">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="ghost"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
        <Icon name="chevron-right" size={16} />
      </Button>
    </div>
  );
}