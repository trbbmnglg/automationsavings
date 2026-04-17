import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({ text, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ left: rect.left + rect.width / 2, top: rect.top - 8 });
    }
  }, []);
  
  const showTooltip = () => { updateCoords(); setIsVisible(true); };
  const hideTooltip = () => setIsVisible(false);

  useEffect(() => {
    if (!isVisible) return;
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isVisible, updateCoords]);

  return (
    <div ref={triggerRef} className="relative inline-flex items-center ml-1.5 cursor-help" tabIndex={0} role="button" aria-describedby={isVisible ? 'tooltip-content' : undefined} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
      {children}
      {isVisible && createPortal(
        <div id="tooltip-content" role="tooltip" className="fixed z-[99999] p-2.5 bg-[#0a0a0a] text-white text-[12px] font-medium text-center shadow-xl leading-relaxed pointer-events-none w-max max-w-[240px] -translate-x-1/2 -translate-y-full" style={{ left: coords.left, top: coords.top }}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
        </div>,
        document.body
      )}
    </div>
  );
}
