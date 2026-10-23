'use client';

import React, { useEffect, useState } from 'react';

/**
 * Precision Odometer Number component.
 * Rolls up numeric values over 400ms on initial mount.
 */
export function OdometerNumber({ value, prefix = '', suffix = '', className = '' }) {
  const numericTarget = typeof value === 'number'
    ? value
    : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 400; // 400ms per Section 6.2

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out quad
      const current = Math.floor(progress * numericTarget);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [numericTarget]);

  const formatted = typeof value === 'string' && value.includes('SAR')
    ? `${displayValue.toLocaleString()} SAR`
    : displayValue.toLocaleString();

  return (
    <span className={`tracking-tight font-bold ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
