import { formatDayName, isSameDay, isToday, weekDays, formatWeekRange } from '../utils/date';
import dotIcon from '../assets/icons/dot.svg';

function Chevron({ direction }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M15 18L9 12L15 6' : 'M9 18L15 12L9 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Monday–Sunday day picker with previous / next week buttons
export default function WeekStrip({ weekStart, selectedDay, onSelectDay, onChangeWeek, daysWithTasks }) {
  const days = weekDays(weekStart);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between px-1.5">
        <button
          type="button"
          onClick={() => onChangeWeek(-1)}
          aria-label="Previous week"
          className="flex size-7 items-center justify-center text-subtle hover:text-primary"
        >
          <Chevron direction="left" />
        </button>
        <span className="text-xs text-subtle">{formatWeekRange(weekStart)}</span>
        <button
          type="button"
          onClick={() => onChangeWeek(1)}
          aria-label="Next week"
          className="flex size-7 items-center justify-center text-subtle hover:text-primary"
        >
          <Chevron direction="right" />
        </button>
      </div>

      <div className="flex justify-between" role="tablist" aria-label="Days of the week">
        {days.map((day) => {
          const selected = isSameDay(day, selectedDay);
          const hasTasks = daysWithTasks.has(day.toDateString());
          return (
            <button
              key={day.toISOString()}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={day.toDateString()}
              onClick={() => onSelectDay(day)}
              className={`flex w-[39px] flex-col items-center gap-1 py-1.5 text-center transition-colors ${
                selected ? 'bg-primary text-white' : isToday(day) ? 'text-primary' : 'text-disabled'
              }`}
            >
              <span className="text-[10px] leading-[22px]">{formatDayName(day)}</span>
              <span className="-mt-1 text-sm leading-[22px] font-medium">
                {String(day.getDate()).padStart(2, '0')}
              </span>
              {/* Dot = this day has tasks (white on the selected day, like the design) */}
              {selected ? (
                <img src={dotIcon} alt="" className={`size-1 ${hasTasks ? '' : 'invisible'}`} />
              ) : (
                <span className={`size-1 rounded-full bg-primary ${hasTasks ? '' : 'invisible'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
