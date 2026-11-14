export default function Toast({ message, type }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-50 flex justify-center px-4">
      <div
        role="status"
        className={`animate-fade-in rounded px-4 py-2.5 text-sm text-white shadow-lg ${
          type === 'error' ? 'bg-danger' : 'bg-ink'
        }`}
      >
        {message}
      </div>
    </div>
  );
}
