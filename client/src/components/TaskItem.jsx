import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatShortDate, formatTime } from '../utils/date';
import { PriorityDot } from './PriorityBadge';
import checkIcon from '../assets/icons/check.svg';
import trashIcon from '../assets/icons/trash.svg';
import editIcon from '../assets/icons/edit.svg';

const DELETE_WIDTH = 88; // width of the red "Delete" area revealed by swiping

export default function TaskItem({ task, showDate = false }) {
  const { openEdit, toggleStatus, deleteTask } = useApp();
  const [status, setStatus] = useState(task.status);
  const [expanded, setExpanded] = useState(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);

  // Keep local status in sync when the list reloads with fresh data
  const [prevStatus, setPrevStatus] = useState(task.status);
  if (task.status !== prevStatus) {
    setPrevStatus(task.status);
    setStatus(task.status);
  }

  const done = status === 'Completed';

  async function handleToggle() {
    // Update the checkbox straight away, then confirm with the server
    setStatus(done ? 'In Progress' : 'Completed');
    setStatus(await toggleStatus({ ...task, status }));
  }

  // ---- Swipe left to reveal "Delete" ----
  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, base: offset, active: false, moved: false };
  }

  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;

    if (!d.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null; // user is scrolling vertically
        return;
      }
      if (Math.abs(dx) < 8) return;
      d.active = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    d.moved = true;
    setOffset(Math.min(0, Math.max(-DELETE_WIDTH, d.base + dx)));
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d?.active) return;
    setOffset((o) => (o < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0));
    // Swallow the click that follows a drag
    if (d.moved) {
      const stop = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      window.addEventListener('click', stop, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
    }
  }

  function handleBodyClick() {
    if (offset !== 0) {
      setOffset(0);
      return;
    }
    setExpanded((x) => !x);
  }

  const meta = [
    showDate ? formatShortDate(task.dueDate) : null,
    formatTime(task.dueDate) + (task.endDate ? ` – ${formatTime(task.endDate)}` : ''),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="relative overflow-hidden">
      {/* Revealed behind the row when swiping left */}
      <button
        type="button"
        onClick={() => deleteTask(task, { skipConfirm: true })}
        tabIndex={offset === 0 ? -1 : 0}
        aria-hidden={offset === 0}
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-danger text-sm font-medium text-white"
        style={{ width: DELETE_WIDTH }}
      >
        Delete
      </button>

      <div
        className={`relative flex touch-pan-y items-start gap-3 bg-(--row-bg) select-none ${
          dragging ? '' : 'transition-transform duration-200'
        }`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? `Mark "${task.title}" as in progress` : `Mark "${task.title}" as completed`}
          onClick={handleToggle}
          className="relative mt-px size-5 shrink-0 border border-primary bg-white"
        >
          {done && <img src={checkIcon} alt="" className="absolute inset-0 size-5" />}
        </button>

        <div className="flex min-w-0 flex-1 items-start gap-3 border-b border-line pb-5">
          <button
            type="button"
            onClick={handleBodyClick}
            aria-expanded={expanded}
            className="min-w-0 flex-1 text-left"
          >
            <p
              className={`text-sm leading-[21px] font-medium break-words text-ink ${done ? 'line-through' : ''}`}
            >
              {task.title}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-subtle">
              <PriorityDot priority={task.priority} />
              <span>
                {meta}
                {task.priority ? ` · ${task.priority}` : ''}
              </span>
            </p>

            {expanded && (
              <div className="animate-fade-in mt-2 space-y-1 text-xs text-muted">
                <p className="break-words whitespace-pre-line">
                  {task.description || <span className="italic">No description</span>}
                </p>
                <p>
                  Status: <span className={done ? 'text-primary' : 'text-ink'}>{status}</span>
                </p>
              </div>
            )}
          </button>

          <div className="flex shrink-0 items-center gap-[11px]">
            <button
              type="button"
              onClick={() => deleteTask(task)}
              aria-label={`Delete "${task.title}"`}
              className="rounded opacity-100 transition-opacity hover:opacity-70"
            >
              <img src={trashIcon} alt="" className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => openEdit(task)}
              aria-label={`Edit "${task.title}"`}
              className="rounded transition-opacity hover:opacity-70"
            >
              <img src={editIcon} alt="" className="size-6" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
