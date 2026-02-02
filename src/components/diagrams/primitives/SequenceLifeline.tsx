/**
 * SequenceLifeline - Vertical dashed line for sequence diagrams
 *
 * Renders a dashed vertical line extending from an actor.
 * Purely decorative element with aria-hidden.
 */

import type { SequenceLifelineProps } from './types';

export function SequenceLifeline({ height, className = '' }: SequenceLifelineProps) {
  return (
    <svg
      width="2"
      height={height}
      className={`mx-auto ${className}`}
      aria-hidden="true"
    >
      <line
        x1="1"
        y1="0"
        x2="1"
        y2={height}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 3"
        className="text-gray-500"
      />
    </svg>
  );
}

export type { SequenceLifelineProps };
