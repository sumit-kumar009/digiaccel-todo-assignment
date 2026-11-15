import { useEffect, useRef, useState } from 'react';
import { tasksApi } from '../api/tasks';
import {
  combineDateTime,
  formatLongDate,
  formatTime,
  toDateInputValue,
  toTimeInputValue,
} from '../utils/date';
import { PriorityDot } from './PriorityBadge';
import { PRIORITIES } from '../utils/priority';
import closeIcon from '../assets/icons/close.svg';
import clockIcon from '../assets/icons/clock.svg';
import calendarIcon from '../assets/icons/calendar.svg';

function initialForm(task, defaultDate) {
  if (task) {
    return {
      title: task.title,
      description: task.description || '',
      date: toDateInputValue(task.dueDate),
      start: toTimeInputValue(task.dueDate),
      end: task.endDate ? toTimeInputValue(task.endDate) : '',
      priority: task.priority || '',
    };
  }
  return {
    title: '',
    description: '',
    date: toDateInputValue(defaultDate || new Date()),
    start: '',
    end: '',
    priority: '',
  };
}

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Please enter a task title';
  if (!form.start) errors.start = 'Pick a start time';
  if (!form.date) errors.date = 'Pick a date';
  if (form.start && form.end && form.end <= form.start) errors.end = 'End must be after start';
  return errors;
}

// Opens the browser's native date/time picker when the styled box is tapped
function openPicker(e) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    /* some browsers only allow showPicker on user gesture – focusing still works */
  }
}

// On phones the on-screen keyboard can cover fields near the bottom of the sheet,
// so scroll the focused field back into view once the keyboard has opened.
function keepInView(e) {
  const field = e.currentTarget;
  setTimeout(() => field.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-medium text-muted">
      {children}
    </label>
  );
}

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-danger">{children}</p>;
}

function PickerField({ id, type, value, onChange, icon, iconSide = 'left', placeholder, display, error }) {
  return (
    <div>
      <div
        className={`relative flex h-10 items-center gap-3 border bg-white px-2.5 text-sm focus-within:border-primary ${
          error ? 'border-danger' : 'border-line'
        } ${iconSide === 'right' ? 'flex-row-reverse justify-between' : ''}`}
      >
        <img src={icon} alt="" className="size-[18px] p-[3px]" />
        <span className="text-ink">{value ? display : placeholder}</span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={openPicker}
          aria-label={placeholder}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}

export default function TaskSheet({ task, defaultDate, onClose, onSaved }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(() => initialForm(task, defaultDate));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Lock page scroll and close on Escape while the sheet is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length) {
      setErrors(found);
      if (found.title) titleRef.current?.focus();
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: combineDateTime(form.date, form.start).toISOString(),
      endDate: form.end ? combineDateTime(form.date, form.end).toISOString() : null,
      priority: form.priority || null,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await tasksApi.update(task.id, payload);
        onSaved('Task updated');
      } else {
        await tasksApi.create(payload);
        onSaved('Task created');
      }
    } catch (err) {
      // Map server field names back to the form fields
      const server = err.errors || {};
      setErrors({
        title: server.title,
        start: server.dueDate,
        end: server.endDate,
        form: Object.keys(server).length ? undefined : err.message,
      });
      setSaving(false);
    }
  }

  const sampleDate = form.date ? combineDateTime(form.date, '00:00') : null;
  const timeDisplay = (value) => (value ? formatTime(combineDateTime(form.date || '2000-01-01', value)) : '');

  return (
    <div className="fixed inset-0 z-30 flex justify-center">
      {/* Shadow overlay from the design */}
      <div className="animate-fade-in absolute inset-0 bg-black/25" onClick={onClose} />

      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onSubmit={handleSubmit}
        noValidate
        className="animate-sheet-up absolute bottom-0 max-h-[92dvh] w-full max-w-md overflow-y-auto bg-white px-6 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between">
          <h2 id="sheet-title" className="text-lg font-medium text-ink">
            {isEdit ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-6 items-center justify-center"
          >
            <img src={closeIcon} alt="" className="w-[15.64px] -rotate-45" />
          </button>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <FieldLabel htmlFor="task-title">Task title</FieldLabel>
            <input
              id="task-title"
              ref={titleRef}
              autoFocus={!isEdit}
              value={form.title}
              onChange={(e) => set('title')(e.target.value)}
              placeholder="Doing Homework"
              maxLength={120}
              className={`h-10 w-full border px-2.5 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-primary ${
                errors.title ? 'border-danger' : 'border-line'
              }`}
            />
            <FieldError>{errors.title}</FieldError>
          </div>

          <div>
            <span className="mb-2 block text-xs font-medium text-muted">Set Time</span>
            <div className="grid grid-cols-2 gap-[30px]">
              <PickerField
                id="task-start"
                type="time"
                value={form.start}
                onChange={set('start')}
                icon={clockIcon}
                placeholder="Start"
                display={timeDisplay(form.start)}
                error={errors.start}
              />
              <PickerField
                id="task-end"
                type="time"
                value={form.end}
                onChange={set('end')}
                icon={clockIcon}
                placeholder="Ends"
                display={timeDisplay(form.end)}
                error={errors.end}
              />
            </div>
          </div>

          <div>
            <span className="mb-2 block text-xs font-medium text-muted">Set Date</span>
            <PickerField
              id="task-date"
              type="date"
              value={form.date}
              onChange={set('date')}
              icon={calendarIcon}
              iconSide="right"
              placeholder="Pick a date"
              display={sampleDate ? formatLongDate(sampleDate) : ''}
              error={errors.date}
            />
          </div>

          <div>
            <span className="mb-2 block text-xs font-medium text-muted">Priority</span>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Priority">
              {PRIORITIES.map((p) => {
                const active = form.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    // Tapping the selected priority again clears it (priority is optional)
                    onClick={() => set('priority')(active ? '' : p)}
                    className={`flex h-10 items-center justify-center gap-2 border text-sm transition-colors ${
                      active ? 'border-primary bg-done-bg text-primary' : 'border-line text-ink'
                    }`}
                  >
                    <PriorityDot priority={p} />
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="task-description">Description</FieldLabel>
            <textarea
              id="task-description"
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              onFocus={keepInView}
              placeholder="Add Description"
              maxLength={1000}
              rows={4}
              className="block h-[100px] w-full resize-none border border-line bg-white px-2.5 py-2.5 text-sm leading-5 text-ink outline-none placeholder:text-ink/40 focus:border-primary"
            />
          </div>
        </div>

        {errors.form && <p className="mt-4 text-sm text-danger">{errors.form}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-[26px] h-12 w-full bg-primary text-base font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
        </button>
      </form>
    </div>
  );
}
