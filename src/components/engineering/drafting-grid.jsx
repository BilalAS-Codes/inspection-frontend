'use client';

import React from 'react';

/**
 * 2. Drafting grid on empty canvas.
 * Rendered on hero public surfaces (login and public verification page).
 * Very faint 1px grid pattern (24px squares) behind hero content.
 */
export function DraftingGrid({ children, className = '' }) {
  return (
    <div className={`relative drafting-grid-bg ${className}`}>
      {children}
    </div>
  );
}
