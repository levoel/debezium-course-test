/**
 * DiagramTooltip - Custom click-based tooltip with glass styling
 *
 * Features:
 * - Click-to-open pattern for Safari/mobile accessibility
 * - Glass styling matching design system
 * - Keyboard accessible (Enter/Space to open, Escape to close)
 * - Click outside to close
 */

import { useState, useRef, useEffect } from 'react';
import type { DiagramTooltipProps } from './types';

export function DiagramTooltip({
  content,
  children,
  side = 'top',
  sideOffset = 8,
}: DiagramTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="appearance-none bg-transparent border-none p-0 m-0 cursor-pointer text-inherit font-inherit"
      >
        {children}
      </button>

      {isOpen && (
        <div
          ref={contentRef}
          role="tooltip"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`
            absolute ${positionClasses[side]}
            bg-gray-900/95 backdrop-blur-md border border-white/20
            rounded-xl px-4 py-3 w-96
            text-sm text-gray-200 leading-relaxed
            shadow-2xl shadow-black/50
            z-[9999]
            transition-opacity duration-150
          `.trim()}
          style={{ marginBottom: side === 'top' ? sideOffset : undefined, marginTop: side === 'bottom' ? sideOffset : undefined }}
        >
          {content}
        </div>
      )}
    </span>
  );
}

export type { DiagramTooltipProps };
