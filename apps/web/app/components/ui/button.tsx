import { cn } from '../../lib/utils';
import type { ButtonHTMLAttributes } from 'react';
export function Button({
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  return <button type={type} className={cn('button', `button-${variant}`, className)} {...props} />;
}
