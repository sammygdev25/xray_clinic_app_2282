import type { Report } from '../types';
import { Card, CardBody, CardTitle, CardMeta, EmptyState } from '../components/ui';
import { Icon } from '../components/icons';

interface ReportViewProps {
  report: Report | null | undefined;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ReportView({ report }: ReportViewProps) {
  if (!report) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon="list"
            title="No report yet"
            text="The radiologist has not published findings for this exam. Check back once the reading is complete."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="ds-between">
          <CardTitle>Radiology Report</CardTitle>
          <Icon name="edit" />
        </div>
        <CardMeta>
          {report.radiologist
            ? `Reported by Dr. ${report.radiologist.firstName} ${report.radiologist.lastName}`
            : 'Reported by radiology staff'}
          {report.createdAt ? ` · ${formatDateTime(report.createdAt)}` : ''}
        </CardMeta>
        <div className="ds-stack" style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {report.content}
        </div>
      </CardBody>
    </Card>
  );
}

export default ReportView;
export { ReportView };
