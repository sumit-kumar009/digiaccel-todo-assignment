import TaskItem from './TaskItem';

export default function TaskList({ tasks, loading, error, emptyText, showDate = false, onRetry }) {
  if (loading && !tasks.length) {
    return (
      <ul className="space-y-[23px]" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex animate-pulse items-start gap-3">
            <div className="size-5 bg-line" />
            <div className="flex-1 border-b border-line pb-5">
              <div className="h-4 w-2/3 bg-line" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-sm text-muted">
        <p>{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-2 font-medium text-primary">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!tasks.length) {
    return <p className="py-6 text-center text-sm text-muted">{emptyText}</p>;
  }

  return (
    <ul className="space-y-[23px]">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} showDate={showDate} />
      ))}
    </ul>
  );
}
