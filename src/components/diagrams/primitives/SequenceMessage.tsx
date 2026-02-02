/**
 * SequenceMessage - Horizontal arrow with label for sequence diagrams
 *
 * Renders message arrows between lifelines with sync/async/return variants.
 * Uses forwardRef for Radix Tooltip compatibility.
 */

import { forwardRef } from 'react';
import type { SequenceMessageProps } from './types';

export const SequenceMessage = forwardRef<SVGGElement, SequenceMessageProps>(
  function SequenceMessage(
    {
      fromX,
      toX,
      y,
      label,
      variant = 'sync',
      className = '',
      onClick,
      tabIndex,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const isLeftToRight = toX > fromX;
    const arrowheadSize = 8;

    // Line style based on variant
    const lineStyle =
      variant === 'return' ? { strokeDasharray: '4 2' } : {};

    // Arrowhead style (filled for sync, open for async/return)
    const arrowFill = variant === 'sync' ? 'currentColor' : 'none';

    // Arrow path - arrowhead at destination end
    const arrowPath = isLeftToRight
      ? `M${toX - arrowheadSize},${y - arrowheadSize / 2} L${toX},${y} L${toX - arrowheadSize},${y + arrowheadSize / 2}`
      : `M${toX + arrowheadSize},${y - arrowheadSize / 2} L${toX},${y} L${toX + arrowheadSize},${y + arrowheadSize / 2}`;

    const isInteractive = !!onClick;

    return (
      <g
        ref={ref}
        className={`text-gray-400 ${className}`}
        onClick={onClick}
        tabIndex={tabIndex}
        role={isInteractive ? 'button' : undefined}
        style={{ cursor: isInteractive ? 'pointer' : undefined }}
        aria-label={ariaLabel}
      >
        {/* Line */}
        <line
          x1={fromX}
          y1={y}
          x2={toX}
          y2={y}
          stroke="currentColor"
          strokeWidth="1.5"
          {...lineStyle}
        />

        {/* Arrowhead */}
        <path
          d={arrowPath}
          stroke="currentColor"
          strokeWidth="1.5"
          fill={arrowFill}
          strokeLinejoin="round"
        />

        {/* Label */}
        <text
          x={(fromX + toX) / 2}
          y={y - 6}
          textAnchor="middle"
          className="text-xs fill-gray-300"
        >
          {label}
        </text>
      </g>
    );
  }
);

export type { SequenceMessageProps };
