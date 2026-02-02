/**
 * Arrow - SVG directional arrow connector for diagrams
 *
 * Supports 4 directions, optional labels, and dashed variant for
 * optional/async flows. Renders a proper line with arrowhead.
 */

import type { ArrowProps, ArrowDirection } from './types';

// SVG paths for arrowheads at the end of lines
const arrowheadPaths: Record<ArrowDirection, { line: string; head: string }> = {
  right: {
    line: 'M4 12 L16 12',
    head: 'M14 8 L20 12 L14 16',
  },
  down: {
    line: 'M12 4 L12 16',
    head: 'M8 14 L12 20 L16 14',
  },
  left: {
    line: 'M20 12 L8 12',
    head: 'M10 8 L4 12 L10 16',
  },
  up: {
    line: 'M12 20 L12 8',
    head: 'M8 10 L12 4 L16 10',
  },
};

export function Arrow({
  direction = 'right',
  label,
  dashed = false,
  className = '',
}: ArrowProps) {
  const paths = arrowheadPaths[direction];
  const isHorizontal = direction === 'right' || direction === 'left';

  return (
    <div
      className={`
        relative flex items-center justify-center
        ${className}
      `.trim()}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {/* Line */}
        <path
          strokeLinecap="round"
          strokeWidth={2}
          strokeDasharray={dashed ? '4 2' : undefined}
          d={paths.line}
        />
        {/* Arrowhead */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={paths.head}
        />
      </svg>
      {label && (
        <span
          className={`
            absolute text-xs text-gray-400 whitespace-nowrap
            ${isHorizontal ? 'top-full mt-0.5' : 'left-full ml-1'}
          `}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export type { ArrowProps };
