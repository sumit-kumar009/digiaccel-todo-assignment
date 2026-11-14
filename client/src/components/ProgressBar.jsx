export default function ProgressBar({ completed, total }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-black">Weekly Progress</h2>
        <span className="text-xs text-subtle">
          {completed}/{total} done
        </span>
      </div>
      <div
        className="mt-[14px] h-6 bg-track"
        role="progressbar"
        aria-label="Weekly progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="h-full bg-navy transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
