/**
 * DiagramTooltip - Custom click-based tooltip with glass styling
 *
 * Features:
 * - Click-to-open pattern for Safari/mobile accessibility
 * - Glass styling matching design system
 * - Keyboard accessible (Enter/Space to open, Escape to close)
 * - Click outside to close
 * - Portal rendering to escape stacking contexts
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { DiagramTooltipProps } from './types';

export function DiagramTooltip({
  content,
  children,
  side = 'top',
  sideOffset = 8,
}: DiagramTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate position based on trigger element
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 384; // w-96 = 24rem = 384px

    let top = 0;
    let left = 0;

    switch (side) {
      case 'top':
        top = rect.top - sideOffset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + sideOffset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - tooltipWidth - sideOffset;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + sideOffset;
        break;
    }

    // Keep tooltip within viewport
    const padding = 16;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    setPosition({ top, left });
  }, [side, sideOffset]);

  // Update position when opening
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

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

    const handleScroll = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const transformOrigin = {
    top: 'bottom center',
    bottom: 'top center',
    left: 'center right',
    right: 'center left',
  };

  const translateY = side === 'top' ? '-100%' : side === 'bottom' ? '0' : '-50%';

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

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={contentRef}
            role="tooltip"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className="
              fixed w-96
              bg-gray-900/95 backdrop-blur-md border border-white/20
              rounded-xl px-4 pt-3 pb-5
              text-sm text-gray-200 leading-relaxed
              shadow-2xl shadow-black/50
              z-[9999]
              transition-opacity duration-150
              pointer-events-auto
            "
            style={{
              top: position.top,
              left: position.left,
              transform: `translateY(${translateY})`,
              transformOrigin: transformOrigin[side],
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  );
}

export type { DiagramTooltipProps };
