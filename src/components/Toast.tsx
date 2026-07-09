import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#131920',
      border: '1px solid #243447',
      borderLeft: '3px solid #2ECC71',
      borderRadius: 6,
      padding: '10px 20px',
      color: '#86EFAC',
      fontSize: 13,
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.04em',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      animation: 'toastIn 0.3s ease-out both',
      whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  );
}
