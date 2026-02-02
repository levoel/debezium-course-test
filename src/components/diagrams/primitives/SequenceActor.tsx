/**
 * SequenceActor - Glass-styled sequence diagram participant box
 *
 * Renders participant boxes for sequence diagrams with variant-specific colors.
 * Uses forwardRef for Radix Tooltip compatibility.
 */

import { forwardRef } from 'react';
import type { SequenceActorProps, SequenceActorVariant } from './types';

const variantStyles: Record<SequenceActorVariant, string> = {
  database: 'bg-purple-500/20 border-purple-400/30 text-purple-200',
  service: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
  queue: 'bg-blue-500/20 border-blue-400/30 text-blue-200',
  external: 'bg-gray-500/20 border-gray-400/30 text-gray-200',
};

export const SequenceActor = forwardRef<HTMLDivElement, SequenceActorProps>(
  function SequenceActor(
    {
      children,
      variant = 'service',
      className = '',
      onClick,
      tabIndex,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const isInteractive = !!onClick;

    return (
      <div
        ref={ref}
        className={`
          px-3 py-2 rounded-lg border backdrop-blur-md
          text-sm font-medium text-center
          shadow-md shadow-black/20
          min-w-[60px] max-w-[120px]
          focus:outline-none focus:ring-2 focus:ring-white/30
          ${variantStyles[variant]}
          ${isInteractive ? 'cursor-pointer hover:brightness-110' : ''}
          ${className}
        `.trim()}
        onClick={onClick}
        tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
        role={isInteractive ? 'button' : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    );
  }
);

export type { SequenceActorProps };
