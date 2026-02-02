/**
 * FlowNode - Glass-styled diagram node component
 *
 * Renders nodes with variant-specific colors, sizes, and accessibility features.
 * Uses forwardRef for Radix Tooltip compatibility.
 */

import { forwardRef } from 'react';
import type { FlowNodeProps, FlowNodeVariant } from './types';

const variantStyles: Record<FlowNodeVariant, string> = {
  database: 'bg-purple-500/20 border-purple-400/30 text-purple-200',
  connector: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200',
  cluster: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100',
  sink: 'bg-blue-500/15 border-blue-400/30 text-blue-200',
  app: 'bg-rose-500/15 border-rose-400/30 text-rose-200',
  target: 'bg-rose-500/20 border-rose-400/40 text-rose-100',
};

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

export const FlowNode = forwardRef<HTMLDivElement, FlowNodeProps>(
  function FlowNode(
    {
      children,
      variant = 'connector',
      size = 'md',
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
          rounded-xl border backdrop-blur-md
          font-medium text-center
          shadow-lg shadow-black/20
          hover:brightness-110 hover:scale-[1.02] transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${isInteractive ? 'cursor-pointer' : ''}
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

export type { FlowNodeProps };
