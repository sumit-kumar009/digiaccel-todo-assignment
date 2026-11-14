import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import { useApp } from '../context/AppContext';
import useTasks from '../hooks/useTasks';
import WeekStrip from '../components/WeekStrip';
import SummaryCards from '../components/SummaryCards';
import ProgressBar from '../components/ProgressBar';
import TaskList from '../components/TaskList';
import { addDays, formatShortDate, isSameDay, isToday, startOfWeek } from '../utils/date';
import searchIcon from '../assets/icons/search.svg';
import fabCircle from '../assets/icons/fab-circle.svg';
import plusIcon from '../assets/icons/plus.svg';

export default function Home() {
  const { openCreate } = useApp();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const { data: tasks, loading, error, reload } = useTasks(
    () => tasksApi.list({ from: weekStart, to: addDays(weekStart, 7) }),
    [weekStart.getTime()]
  );

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    return { completed, pending: tasks.length - completed, total: tasks.length };
  }, [tasks]);

  const daysWithTasks = useMemo(() => new Set(tasks.map((t) => new Date(t.dueDate).toDateString())), [tasks]);
  const dayTasks = tasks.filter((t) => isSameDay(t.dueDate, selectedDay));

  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date()));

  function changeWeek(step) {
    const next = addDays(weekStart, step * 7);
    setWeekStart(next);
    // Select today when returning to the current week, otherwise the Monday
    setSelectedDay(isSameDay(next, startOfWeek(new Date())) ? new Date() : next);
  }

  const dayTitle = isToday(selectedDay)
    ? 'Tasks Today'
    : `Tasks · ${selectedDay.toLocaleDateString('en-US', { weekday: 'short' })} ${formatShortDate(selectedDay)}`;

  return (
    <main className="px-6 pt-[37px] pb-36">
      <Link
        to="/search"
        className="flex h-[47px] items-center justify-between rounded border border-field bg-white pr-[14px] pl-5"
      >
        <span className="text-xs font-light text-black/60">Search for a task</span>
        <img src={searchIcon} alt="" className="size-[17.5px]" />
      </Link>

      <section className="mt-3" aria-label="Choose a day">
        <WeekStrip
          weekStart={weekStart}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onChangeWeek={changeWeek}
          daysWithTasks={daysWithTasks}
        />
      </section>

      <section className="mt-[30px]" aria-label="Week summary">
        <SummaryCards
          completed={stats.completed}
          pending={stats.pending}
          caption={isCurrentWeek ? 'This Week' : 'That Week'}
        />
      </section>

      <section className="mt-[30px]">
        <ProgressBar completed={stats.completed} total={stats.total} />
      </section>

      <section className="mt-[30px]">
        <div className="mb-[23px] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{dayTitle}</h2>
          <Link to="/weeks" className="text-sm font-medium text-primary">
            View All
          </Link>
        </div>
        <TaskList
          tasks={dayTasks}
          loading={loading}
          error={error}
          onRetry={reload}
          emptyText="No tasks for this day. Tap + to add one."
        />
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[max(28px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => openCreate(selectedDay)}
          aria-label="Add task"
          className="pointer-events-auto relative size-[76px] rounded-full shadow-[0_8px_20px_rgba(69,102,236,0.35)] transition-transform active:scale-95"
        >
          <img src={fabCircle} alt="" className="absolute inset-0 size-[76px]" />
          <img src={plusIcon} alt="" className="absolute top-1/2 left-1/2 size-[21.23px] -translate-1/2" />
        </button>
      </div>
    </main>
  );
}
