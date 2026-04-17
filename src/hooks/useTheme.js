import { useMemo, useEffect } from 'react';

/**
 * Accenture-brand theme styles. Both theme color variants (default + violet)
 * now render Accenture-compliant purple; the themeColor arg is retained for
 * back-compat with persisted user preferences but produces minimal visual
 * difference. Dark mode uses pure black backgrounds per brand guidance.
 *
 * Design decisions per Accenture July 2025 v4:
 *   - Light is default; background = #F1F1EF (gray-off-white)
 *   - Dark uses pure #000000 expanse
 *   - Cards: sharp corners (no rounded-[28px] / )
 *   - Inputs: sharp, single ring, focus = accenture-purple
 *   - No gradients on chrome (only for decorative accents if any)
 */
export function useTheme(isDarkMode, themeColor = 'default') {

  useEffect(() => {
    document.body.setAttribute('data-theme', themeColor);
  }, [themeColor]);

  return useMemo(() => {
    const isViolet = themeColor === 'violet';

    return {
      bgMain:      isDarkMode ? 'bg-black' : 'bg-accenture-gray-off-white',
      textMain:    isDarkMode ? 'text-accenture-gray-off-white' : 'text-black',
      textHeading: isDarkMode ? 'text-white' : 'text-black',
      textSub:     isDarkMode ? 'text-accenture-gray-light' : 'text-accenture-gray-dark',
      borderMuted: isDarkMode ? 'border-[#222]' : 'border-accenture-gray-light',
      panelBg:     isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white',
      cardStyle: [
        isDarkMode
          ? 'bg-[#0a0a0a] border-[#222]'
          : 'bg-white border-accenture-gray-light',
        isViolet && !isDarkMode ? 'border-l-2 border-l-accenture-purple' : '',
        'border relative transition-colors duration-200',
      ].filter(Boolean).join(' '),
      inputStyle: [
        'w-full px-3.5 py-2.5 border outline-none transition-colors duration-200',
        isDarkMode
          ? 'bg-[#111] border-[#222] text-white placeholder-accenture-gray-dark focus:border-accenture-purple focus:ring-1 focus:ring-accenture-purple'
          : 'bg-white border-accenture-gray-light text-black placeholder-accenture-gray-dark focus:border-accenture-purple focus:ring-1 focus:ring-accenture-purple',
      ].join(' '),
      inputErrorStyle: [
        'w-full px-3.5 py-2.5 border outline-none transition-colors duration-200',
        isDarkMode
          ? 'bg-[#140a10] border-accenture-pink text-accenture-pink focus:ring-1 focus:ring-accenture-pink'
          : 'bg-white border-accenture-pink text-accenture-pink focus:ring-1 focus:ring-accenture-pink',
      ].join(' '),
    };
  }, [isDarkMode, themeColor]);
}
