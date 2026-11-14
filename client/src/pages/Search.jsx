import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import useTasks from '../hooks/useTasks';
import BackHeader from '../components/BackHeader';
import TaskList from '../components/TaskList';
import searchIcon from '../assets/icons/search.svg';

export default function Search() {
  // Keep the query in the URL so it survives refresh / back navigation
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get('q') || '');
  const [query, setQuery] = useState(text.trim());

  // Wait until the user stops typing before calling the API
  useEffect(() => {
    const id = setTimeout(() => {
      const q = text.trim();
      setQuery(q);
      setParams(q ? { q } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(id);
  }, [text, setParams]);

  const { data: results, loading, error, reload } = useTasks(() => tasksApi.list({ search: query }), [query], {
    enabled: Boolean(query),
  });

  return (
    <main className="px-6 pt-[31px] pb-12">
      <BackHeader />

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mt-[29px] flex h-[47px] items-center rounded border border-field bg-white pr-[14px] pl-5 focus-within:border-primary"
      >
        <label htmlFor="search-input" className="sr-only">
          Search tasks
        </label>
        <input
          id="search-input"
          type="search"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search for a task"
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent pr-3 text-xs font-light text-ink outline-none placeholder:text-black/60 [&::-webkit-search-cancel-button]:hidden"
        />
        <img src={searchIcon} alt="" className="size-[17.5px]" />
      </form>

      <section className="mt-[45px]" aria-live="polite">
        {query ? (
          <TaskList
            tasks={results}
            loading={loading}
            error={error}
            onRetry={reload}
            showDate
            emptyText={`No tasks match "${query}"`}
          />
        ) : (
          <p className="py-6 text-center text-sm text-muted">Search tasks by title or description.</p>
        )}
      </section>
    </main>
  );
}
