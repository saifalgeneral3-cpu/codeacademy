import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const api = {
    toast,
    success: (m, d) => toast(m, 'success', d),
    error: (m, d) => toast(m, 'error', d),
    info: (m, d) => toast(m, 'info', d),
    remove,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onClose }) {
  return (
    <div className="toast-viewport" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
          <span className="toast-icon" aria-hidden="true">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'i'}
          </span>
          <span className="toast-message">{t.message}</span>
          <button className="toast-close" onClick={() => onClose(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
