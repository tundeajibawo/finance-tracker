import React, { useRef, useState } from 'react';

const THRESHOLD = 70;

interface ScreenProps {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Scrollable screen body. Mirrors the RN <Screen> (ScrollView + RefreshControl):
 * same 20px gutters and pull-to-refresh gesture.
 */
export function Screen({ children, refreshing, onRefresh }: ScreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!onRefresh || (ref.current?.scrollTop ?? 0) > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    // ponytail: damped so the sheet lags the finger, matching RefreshControl feel
    const delta = (e.touches[0].clientY - startY.current) / 2;
    setPull(delta > 0 ? Math.min(delta, THRESHOLD + 20) : 0);
  };

  const onTouchEnd = () => {
    if (pull >= THRESHOLD) onRefresh?.();
    startY.current = null;
    setPull(0);
  };

  const spinning = refreshing || pull >= THRESHOLD;

  return (
    <div
      ref={ref}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="flex-1 overflow-y-auto overscroll-y-contain bg-[#fafbfc] px-5 pt-4 pb-6"
    >
      {(pull > 0 || refreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-[height]"
          style={{ height: refreshing ? 36 : pull }}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 border-blue-100 border-t-blue-600 ${
              spinning ? 'animate-spin' : ''
            }`}
          />
        </div>
      )}
      {children}
    </div>
  );
}
