import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({ text, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ left: rect.left + rect.width / 2, top: rect.top - 8 });
    }
  };

  const showTooltip = () => { updateCoords(); setIsVisible(true); };
  const hideTooltip = () => setIsVisible(false);

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', updateCoords, true);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [isVisible]);

  return (
    <div ref={triggerRef} className="relative inline-flex items-center ml-1.5 cursor-help" onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
      {children}
      {isVisible && createPortal(
        <div className="fixed z-[99999] p-2.5 bg-slate-800 text-white text-[12px] font-medium rounded-xl text-center shadow-xl leading-relaxed pointer-events-none w-max max-w-[240px] -translate-x-1/2 -translate-y-full" style={{ left: coords.left, top: coords.top }}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
        </div>,
        document.body
      )}
    </div>
  );
}
