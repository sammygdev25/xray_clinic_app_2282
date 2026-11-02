import { Section } from '../components/ui';
import { Icon } from '../components/icons';

export interface RadiologyWorklistFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
}

export default function RadiologyWorklistFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
}: RadiologyWorklistFiltersProps) {
  return (
    <Section tight>
      <div className="ds-filters">
        <div className="ds-field">
          <label className="ds-label" htmlFor="worklist-search">
            Search patient or body part
          </label>
          <div className="ds-cluster">
            <Icon name="search" size={18} />
            <input
              id="worklist-search"
              className="input"
              type="text"
              placeholder="Search by patient name or body part..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="worklist-status">
            Status
          </label>
          <select
            id="worklist-status"
            className="input"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="">All exams</option>
            <option value="scheduled">Awaiting imaging</option>
            <option value="completed">Ready for report</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor="worklist-sort">
            Sort by
          </label>
          <select
            id="worklist-sort"
            className="input"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="date_desc">Scheduled date (newest)</option>
            <option value="date_asc">Scheduled date (oldest)</option>
            <option value="body_part">Body part (A-Z)</option>
          </select>
        </div>
      </div>
    </Section>
  );
}