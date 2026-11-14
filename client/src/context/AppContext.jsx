import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import TaskSheet from '../components/TaskSheet';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { tasksApi } from '../api/tasks';

const AppContext = createContext(null);

// Holds things that every screen needs: the add/edit sheet, the delete
// confirmation, toast messages and a "version" number that changes whenever
// a task changes so screens know when to reload.
export function AppProvider({ children }) {
  const [sheet, setSheet] = useState(null); // { task?, defaultDate? }
  const [confirmState, setConfirmState] = useState(null);
  const [toast, setToast] = useState(null);
  const [version, setVersion] = useState(0);
  const toastTimer = useRef();

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const openCreate = useCallback((defaultDate) => setSheet({ defaultDate }), []);
  const openEdit = useCallback((task) => setSheet({ task }), []);

  // Returns a promise that resolves to true/false depending on the user's choice
  const confirm = useCallback(
    (options) => new Promise((resolve) => setConfirmState({ ...options, resolve })),
    []
  );

  const closeConfirm = (result) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  const toggleStatus = useCallback(
    async (task) => {
      const next = task.status === 'Completed' ? 'In Progress' : 'Completed';
      try {
        await tasksApi.setStatus(task.id, next);
        refresh();
        return next;
      } catch (err) {
        showToast(err.message, 'error');
        return task.status;
      }
    },
    [refresh, showToast]
  );

  const deleteTask = useCallback(
    async (task, { skipConfirm = false } = {}) => {
      if (!skipConfirm) {
        const ok = await confirm({
          title: 'Delete task?',
          message: `"${task.title}" will be removed permanently.`,
          confirmText: 'Delete',
        });
        if (!ok) return false;
      }
      try {
        await tasksApi.remove(task.id);
        showToast('Task deleted');
        refresh();
        return true;
      } catch (err) {
        showToast(err.message, 'error');
        return false;
      }
    },
    [confirm, refresh, showToast]
  );

  const value = useMemo(
    () => ({ version, refresh, showToast, openCreate, openEdit, confirm, toggleStatus, deleteTask }),
    [version, refresh, showToast, openCreate, openEdit, confirm, toggleStatus, deleteTask]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {sheet && (
        <TaskSheet
          task={sheet.task}
          defaultDate={sheet.defaultDate}
          onClose={() => setSheet(null)}
          onSaved={(message) => {
            setSheet(null);
            showToast(message);
            refresh();
          }}
        />
      )}
      {confirmState && (
        <ConfirmDialog
          {...confirmState}
          onCancel={() => closeConfirm(false)}
          onConfirm={() => closeConfirm(true)}
        />
      )}
      {toast && <Toast {...toast} />}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
