import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

type TextLinkProps = {
  to: string;
  children: string;
  className?: string;
};

export function TextLink({ to, children, className }: TextLinkProps) {
  return (
    <NavLink
      to={to}
      className={cn(
        'inline-flex rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[color-mix(in_srgb,var(--color-elevated)_80%,var(--color-accent-muted))]',
        className,
      )}
    >
      {children}
    </NavLink>
  );
}
