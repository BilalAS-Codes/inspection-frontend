'use client';

import React from 'react';

/**
 * 5. Fade-out hairline dividers.
 * Fades the rightmost 20% to transparent.
 */
export function FadeRule({ className = '' }) {
  return (
    <div
      role="separator"
      className={`w-full h-[1px] fade-rule my-4 ${className}`}
    />
  );
}
