import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getExamList } from '../api';
import type { Exam } from '../types';
import RadiologyWorklistHeader from '../components/RadiologyWorklistHeader';
import RadiologyWorklistFilters from '../components/RadiologyWorklistFilters';
import RadiologyWorklistGrid from '../components/RadiologyWorklistGrid';
import RadiologyWorklistPagination from '../components/RadiologyWorklistPagination';
import { ReportEditorModal } from '../components/ReportEditorModal';
import { Alert } from '../components/ui';

const PAGE_SIZE = 9;

export default function RadiologyWorklistPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [page, setPage] = useState(1);

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const loadExams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getExamList();
      setExams(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load the exam worklist right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sort]);

  const filteredExams = useMemo(() => {
    let result = [...exams];

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((exam) => {
        const patientName = exam.patient
          ? `${exam.patient.firstName} ${exam.patient.lastName} ${exam.patient.username}`.toLowerCase()
          : '';
        return exam.bodyPart.toLowerCase().includes(term) || patientName.includes(term);
      });
    }

    if (statusFilter) {
      result = result.filter((exam) => exam.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = `${a.scheduledDate}T${a.scheduledTime}`;
      const dateB = `${b.scheduledDate}T${b.scheduledTime}`;
      if (sort === 'date_asc') return dateA.localeCompare(dateB);
      if (sort === 'date_desc') return dateB.localeCompare(dateA);
      if (sort === 'body_part') return a.bodyPart.localeCompare(b.bodyPart);
      return 0;
    });

    return result;
  }, [exams, search, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));
  const pagedExams = filteredExams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
  };

  const handleSaveReport = (updatedExam: Exam) => {
    setExams((prev) => prev.map((exam) => (exam.id === updatedExam.id ? updatedExam : exam)));
    setSelectedExam(null);
  };

  return (
    <div className="ds-stack-lg">
      <RadiologyWorklistHeader examCount={filteredExams.length} loading={loading} />

      {error && (
        <div className="ds-container">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <RadiologyWorklistFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
      />

      <RadiologyWorklistGrid exams={pagedExams} loading={loading} onSelectExam={handleSelectExam} />

      <RadiologyWorklistPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {selectedExam && (
        <ReportEditorModal
          exam={selectedExam}
          onSave={handleSaveReport}
          onClose={() => setSelectedExam(null)}
        />
      )}
    </div>
  );
}