// The app's roles for its pages, from the plan like backend/src/access.ts (generated). Hiding a page is for the
// person using the app; the server checks the role on every request.
export const ROLES = ['patient', 'receptionist', 'radiologist'] as const;
export const STAFF_ROLES: readonly string[] = ['receptionist', 'radiologist'];
export const HOME_BY_ROLE: Record<string, string> = { patient: '/', receptionist: '/staff/exams', radiologist: '/staff/exams' };

export function homeFor(role: string | null | undefined): string {
  return (role && HOME_BY_ROLE[role]) || '/';
}

// The roles that may create, edit or delete each model; a page several roles share renders its write
// controls only for them (the server refuses the others anyway).
export const WRITERS: Record<string, readonly string[]> = { Room: ['receptionist'], Exam: ['receptionist'], Report: ['radiologist'], Invoice: ['receptionist'] };

export function canWrite(role: string | null | undefined, model: string): boolean {
  return typeof role === 'string' && (WRITERS[model] ?? []).includes(role);
}
