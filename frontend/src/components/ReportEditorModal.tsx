import { useState } from 'react';
import { createReport, updateReport } from '../api';
import { Button, Alert } from './ui';
import { Icon } from './icons';
import type { Exam, Report } from '../types';

interface ReportEditorModalProps {
  exam: Exam;
  onSave: (exam: Exam) => void;
  onClose: () => void;
}

export function ReportEditorModal({ exam, onSave, onClose }: ReportEditorModalProps) {
  const existingReport = exam.reports?.[0];
  const [content, setContent] = useState(existingReport?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const hasReport = Boolean(existingReport?.id);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Report findings cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let saved: Report;
      if (hasReport && existingReport) {
        saved = await updateReport(existingReport.id, { content: content.trim() });
      } else {
        saved = await createReport({ examId: exam.id, content: content.trim() } as Omit<Report, 'id'>);
      }
      onSave({ ...exam, reports: [saved], status: 'completed' });
    } catch (err: any) {
      setError(err?.message || 'Could not save the report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 32, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="ds-card"
        style={{ width: '100%', maxWidth: '640px', margin: '0 1rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ds-card-body">
          <div className="ds-between" style={{ marginBottom: '0.75rem' }}>
            <div>
              <h2 className="ds-card-title">
                {hasReport ? 'Edit report' : 'Author report'} &mdash; {exam.bodyPart}
              </h2>
              <p className="ds-card-meta">
                Patient: {exam.patient ? `${exam.patient.firstName} ${exam.patient.lastName}` : `#${exam.patientId}`}
                {' Â· '}
                {exam.scheduledDate} at {exam.scheduledTime}
              </p>
            </div>
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={onClose}
              aria-label="Close report editor"
            >
              <Icon name="close" />
            </button>
          </div>

          {error && (
            <Alert tone="danger" >
              {error}
            </Alert>
          )}

          <div className="ds-field">
            <label className="ds-label" htmlFor="report-content">
              Findings and impression
            </label>
            <textarea
              id="report-content"
              className="input"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe findings, impression and recommendations for this X-ray exam..."
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono, monospace)' }}
            />
            <span className="ds-help">
              This report is attached to the patient's exam and visible on their dashboard once saved.
            </span>
          </div>

          <div className="ds-form-actions">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : hasReport ? 'Update report' : 'Save report'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportEditorModal;
