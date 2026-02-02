/**
 * Arrow - SVG directional arrow connector for diagrams
 *
 * Supports 4 directions, optional labels, and dashed variant for
 * optional/async flows.
 */

import type { ArrowProps, ArrowDirection } from './types';

const arrowPaths: Record<ArrowDirection, string> = {
  right: 'M9 5l7 7-7 7',
  down: 'M5 9l7 7 7-7',
  left: 'M15 19l-7-7 7-7',
  up: 'M19 15l-7-7-7 7',
};

export function Arrow({
  direction = 'right',
  label,
  dashed = false,
  className = '',
}: ArrowProps) {
  const isVertical = direction === 'up' || direction === 'down';

  return (
    <div
      className={`
        flex items-center justify-center
        ${isVertical ? 'flex-row gap-1' : 'flex-col gap-0.5'}
        ${className}
      `.trim()}
    >
      <div className={`flex items-center justify-center ${isVertical ? '' : 'px-2'}`}>
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            strokeDasharray={dashed ? '4 2' : undefined}
            d={arrowPaths[direction]}
          />
        </svg>
      </div>
      {label && (
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

export type { ArrowProps };
