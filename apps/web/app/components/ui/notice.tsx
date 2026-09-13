import type { ReactNode } from 'react';
export function Notice({
  children,
  error = false,
  id,
}: {
  children: ReactNode;
  error?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`notice ${error ? 'notice-error' : ''}`}
      role={error ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}
