import { useState } from 'react';
import { tasksApi } from '../api/tasks';
import { useApp } from '../context/AppContext';
import useTasks from '../hooks/useTasks';
import BackHeader from '../components/BackHeader';
import TaskList from '../components/TaskList';
import { addDays, formatWeekRange, isSameDay, startOfWeek } from '../utils/date';
import completeBadge from '../assets/icons/complete-badge.svg';
import pendingBadge from '../assets/icons/pending-badge.svg';

function Count({ label, value, badge, badgeSize, bg, badgeBg }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${bg}`}>
      <span className={`flex size-6 items-center justify-center ${badgeBg}`}>
        <img src={badge} alt="" style={{ width: badgeSize, height: badgeSize }} />
      </span>
      <span className="text-xs text-ink">
        <span className="text-base font-semibold">{value}</span> {label}
      </span>
    </div>
  );
}

function WeekCard({ week, expanded, onToggle }) {
  const { openCreate } = useApp();
  const weekStart = new Date(week.weekStart);
  const isCurrent = isSameDay(weekStart, startOfWeek(new Date()));

  // Only load a week's tasks once its card is opened
  const { data: tasks, loading, error, reload } = useTasks(
    () => tasksApi.list({ from: weekStart, to: addDays(weekStart, 7) }),
    [week.weekStart],
    { enabled: expanded }
  );

  return (
    <li className="border border-line bg-white [--row-bg:#fff]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 pt-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-ink">{formatWeekRange(weekStart)}</p>
          <p className="text-[11px] text-subtle">
            {isCurrent ? 'This week · ' : ''}
            {week.total} {week.total === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-subtle transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="grid grid-cols-2 gap-3 px-4 pt-3 pb-4">
        <Count
          label="Open"
          value={week.open}
          badge={pendingBadge}
          badgeSize={16}
          bg="bg-pending-bg"
          badgeBg="bg-pending-badge"
        />
        <Count
          label="Completed"
          value={week.completed}
          badge={completeBadge}
          badgeSize={20}
          bg="bg-done-bg"
          badgeBg="bg-done-badge"
        />
      </div>

      {expanded && (
        <div className="animate-fade-in border-t border-line px-4 pt-5 pb-4">
          <TaskList tasks={tasks} loading={loading} error={error} onRetry={reload} showDate emptyText="No tasks" />
          <button
            type="button"
            onClick={() => openCreate(isCurrent ? new Date() : weekStart)}
            className="mt-4 text-sm font-medium text-primary"
          >
            + Add task to this week
          </button>
        </div>
      )}
    </li>
  );
}

export default function Weeks() {
  const { openCreate } = useApp();
  const { data: weeks, loading, error, reload } = useTasks(() => tasksApi.weeks(), []);
  const [open, setOpen] = useState(() => new Set());

  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <main className="px-6 pt-[31px] pb-12">
      <BackHeader title="All Weeks" />
      <p className="mt-2 text-xs text-subtle">Tap a week to see its tasks.</p>

      <section className="mt-6">
        {loading && !weeks.length ? (
          <div className="space-y-4" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-[132px] animate-pulse bg-line/60" />
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-muted">
            <p>{error}</p>
            <button type="button" onClick={reload} className="mt-2 font-medium text-primary">
              Try again
            </button>
          </div>
        ) : weeks.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted">
            <p>No tasks yet.</p>
            <button type="button" onClick={() => openCreate()} className="mt-2 font-medium text-primary">
              Create your first task
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {weeks.map((week) => (
              <WeekCard
                key={week.weekStart}
                week={week}
                expanded={open.has(week.weekStart)}
                onToggle={() => toggle(week.weekStart)}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
