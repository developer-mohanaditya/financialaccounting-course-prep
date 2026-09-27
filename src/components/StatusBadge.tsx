import type { ExamStatus } from '../lib/progress';
import { IconCheck, IconDot, IconLock } from './Icons';

const LABELS: Record<ExamStatus, string> = {
  locked: 'Locked',
  available: 'Available',
  'in-progress': 'In progress',
  completed: 'Completed',
};

export function StatusBadge({ status, score }: { status: ExamStatus; score?: number | null }) {
  const label = status === 'completed' && score !== null && score !== undefined
    ? `Completed · ${score.toFixed(2)}`
    : LABELS[status];

  return (
    <span className={`badge badge-${status === 'in-progress' ? 'progress' : status}`}>
      {status === 'locked' && <IconLock />}
      {status === 'completed' && <IconCheck />}
      {status === 'available' && <IconDot />}
      {status === 'in-progress' && <IconDot />}
      {label}
    </span>
  );
}

export function StatusIcon({ status }: { status: ExamStatus }) {
  if (status === 'locked') return <IconLock />;
  if (status === 'completed') return <IconCheck />;
  return <IconDot />;
}
