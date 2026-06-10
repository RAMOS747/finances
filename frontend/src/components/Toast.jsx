import { useEffect } from 'react';

// type: 'error' | 'success' | 'warning'
export default function Toast({ message, type = 'error', duration = 3000, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type}`} role="alert">
      {message}
    </div>
  );
}
