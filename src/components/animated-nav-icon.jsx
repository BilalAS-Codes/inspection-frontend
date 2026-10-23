'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedNavIcon Component
 *
 * Precision Industrial Navigation Icon System:
 * - 100% Pure SVG line art with zero unwanted background fills across all icons.
 * - Documents folder:
 *   - Emerging document card has an opaque background (white in light mode, slate-800 in dark mode)
 *     so that whatever is behind the document (folder tab / back lines) is completely occluded.
 *   - Front folder flap also has an opaque background so the lower part of the sheet is neatly tucked inside.
 *   - Persistent open state: when active on /documents (isActive), the document stays open and does not
 *     collapse when mouse leave occurs. On other routes, it opens on hover and closes on hover leave.
 *
 * @param {{
 *   type: 'Dashboard' | 'Leads' | 'Proposals' | 'Invoices' | 'Work Orders' | 'Documents' | 'Certificates' | 'Reports' | 'Audit',
 *   isActive: boolean,
 *   isHovered: boolean,
 *   className?: string
 * }} props
 */

// Snappy spring with subtle overshoot for clean physical feel
const ICON_SPRING = {
  type: 'spring',
  stiffness: 340,
  damping: 18,
  mass: 0.75,
};

// Smooth cubic-bezier for path drawing & multi-keyframe sweeps
const DRAW_TRANSITION = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};

export function AnimatedNavIcon({ type, isActive, isHovered, className = '' }) {
  const activeOrHover = isActive || isHovered;

  // Pure line art stroke opacities:
  // Active state is crisp and prominent (1.0), hover is 0.95, idle is 0.82.
  const baseStrokeOpacity = isActive ? 1 : isHovered ? 0.95 : 0.82;

  const commonSvgProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `w-[22px] h-[22px] shrink-0 overflow-visible ${className}`,
  };

  switch (type) {
    case 'Dashboard':
      // Bento Grid: 4 precision tiles with top-right hero widget lifting and tilting on hover/active
      return (
        <svg {...commonSvgProps}>
          {/* Top-left container tile */}
          <motion.rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1.5"
            fill="none"
            animate={{
              strokeOpacity: baseStrokeOpacity,
              scale: activeOrHover ? 0.92 : 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
          {/* Bottom-left container tile */}
          <motion.rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1.5"
            fill="none"
            animate={{
              strokeOpacity: baseStrokeOpacity,
              scale: activeOrHover ? 0.92 : 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
          {/* Bottom-right container tile */}
          <motion.rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1.5"
            fill="none"
            animate={{
              strokeOpacity: baseStrokeOpacity,
              scale: activeOrHover ? 0.92 : 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
          {/* Top-right (Hero focal tile) */}
          <motion.rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1.5"
            fill="none"
            animate={{
              x: activeOrHover ? 1.75 : 0,
              y: activeOrHover ? -1.75 : 0,
              rotate: activeOrHover ? 15 : 0,
              scale: activeOrHover ? 1.08 : 1,
              strokeOpacity: isActive ? 1 : 0.95,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
        </svg>)
    case 'Clients':
      // Enterprise Facility & Corporate Portal: Precision architectural structure with active beacon
      return (
        <svg {...commonSvgProps}>
          {/* Main building perimeter */}
          <motion.rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="2"
            fill="none"
            animate={{
              strokeOpacity: baseStrokeOpacity,
              scale: activeOrHover ? 1.02 : 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}
            transition={ICON_SPRING}
          />
          {/* Architectural windows grid */}
          <motion.path
            d="M7.5 7.5h2 M14.5 7.5h2 M7.5 11.5h2 M14.5 11.5h2"
            fill="none"
            animate={{
              strokeOpacity: activeOrHover ? 1 : 0.65,
            }}
            transition={ICON_SPRING}
          />
          {/* Entrance portal */}
          <motion.path
            d="M9.5 20.5v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5"
            fill="none"
            animate={{
              strokeOpacity: baseStrokeOpacity,
              y: activeOrHover ? -1 : 0,
            }}
            transition={ICON_SPRING}
          />
          {/* Rooftop communication beacon */}
          <motion.circle
            cx="12"
            cy="1.5"
            r="1"
            className="fill-current"
            animate={{
              scale: activeOrHover ? [1, 1.4, 1] : 1,
              opacity: activeOrHover ? 1 : 0.6,
            }}
            transition={{ repeat: activeOrHover ? Infinity : 0, duration: 1.5 }}
          />
        </svg>
      );

    case 'Leads':
      // Precision Envelope Pocket with Emerging Lead Card
      return (
        <svg {...commonSvgProps}>
          {/* Envelope back & bottom pocket */}
          <motion.path
            d="M3 8.5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5"
            fill="none"
            animate={{ strokeOpacity: baseStrokeOpacity }}
            transition={ICON_SPRING}
          />
          {/* Inner pocket fold lines */}
          <motion.path
            d="M3 18.5l6-5.5 M21 18.5l-6-5.5"
            fill="none"
            animate={{ strokeOpacity: activeOrHover ? 0.35 : 0.55 }}
            transition={ICON_SPRING}
          />
          {/* Rising Lead Card */}
          <motion.g
            animate={{
              y: activeOrHover ? -3.5 : 0,
              scale: activeOrHover ? 1.04 : 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          >
            <motion.rect
              x="6"
              y="6"
              width="12"
              height="8"
              rx="1.5"
              fill="none"
              animate={{ strokeOpacity: isActive ? 1 : 0.95 }}
              transition={ICON_SPRING}
            />
            <motion.path
              d="M9 9.5h6"
              animate={{
                pathLength: 1,
                strokeOpacity: 1,
              }}
              transition={DRAW_TRANSITION}
            />
          </motion.g>
          {/* Envelope V-Flap */}
          <motion.path
            d="M3 8.5l9 5.5 9-5.5"
            fill="none"
            animate={{ strokeOpacity: activeOrHover ? 0.6 : 0.9 }}
            transition={ICON_SPRING}
          />
        </svg>
      );

    case 'Proposals':
      // Executive Legal Agreement Contract: Sleek document sheet with structured clause rules and drawing signature
      return (
        <svg {...commonSvgProps}>
          {/* Main contract agreement sheet */}
          <motion.rect
            x="4.5"
            y="2.5"
            width="15"
            height="19"
            rx="2"
            fill="none"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              strokeOpacity: baseStrokeOpacity,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
          {/* Header title pill */}
          <motion.rect
            x="7.5"
            y="5.5"
            width="4.5"
            height="1.75"
            rx="0.5"
            fill="none"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              strokeOpacity: 1,
            }}
            transition={ICON_SPRING}
          />
          {/* Clause line 1 */}
          <motion.path
            d="M7.5 9.5h9"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              pathLength: 1,
              strokeOpacity: activeOrHover ? 0.95 : 0.75,
            }}
            transition={DRAW_TRANSITION}
          />
          {/* Clause line 2 */}
          <motion.path
            d="M7.5 12.5h6.5"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              pathLength: 1,
              strokeOpacity: activeOrHover ? 0.95 : 0.75,
            }}
            transition={{ ...DRAW_TRANSITION, delay: activeOrHover ? 0.04 : 0 }}
          />
          {/* Formal legal signature stroke on baseline */}
          <motion.path
            d="M7.5 17c1.5-1.2 2.75 0.8 4.25-0.4s2.25 0.6 4-0.4"
            initial={false}
            animate={{
              y: activeOrHover ? -1.5 : 0,
              pathLength: 1,
              strokeOpacity: 1,
            }}
            transition={{ ...DRAW_TRANSITION, delay: activeOrHover ? 0.08 : 0 }}
          />
          {/* Signature baseline guide */}
          <motion.path
            d="M7.5 18h9"
            strokeDasharray="1.5 1.5"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              strokeOpacity: activeOrHover ? 0.5 : 0.3,
            }}
            transition={ICON_SPRING}
          />
        </svg>
      );

    case 'Invoices':
      // Financial Tax Invoice Voucher: Serrated receipt with itemized line items, subtotal rule, and bold total
      return (
        <svg {...commonSvgProps}>
          {/* Scalloped receipt voucher body */}
          <motion.path
            d="M4.5 2.5h15a1.5 1.5 0 0 1 1.5 1.5v16.5l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5-1.5-0.9V4a1.5 1.5 0 0 1 1.5-1.5z"
            fill="none"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              strokeOpacity: baseStrokeOpacity,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
          {/* Header: Invoice code on left, SAR badge on right */}
          <motion.path
            d="M7.5 6h4.5 M15 6h2"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              strokeOpacity: activeOrHover ? 0.9 : 0.7,
            }}
            transition={DRAW_TRANSITION}
          />
          {/* Item 1: Description + Amount */}
          <motion.path
            d="M7.5 9.5h5 M15 9.5h2"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              pathLength: 1,
              strokeOpacity: activeOrHover ? 0.85 : 0.65,
            }}
            transition={DRAW_TRANSITION}
          />
          {/* Item 2: Description + Amount */}
          <motion.path
            d="M7.5 12h3.5 M15 12h2"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              pathLength: 1,
              strokeOpacity: activeOrHover ? 0.85 : 0.65,
            }}
            transition={{ ...DRAW_TRANSITION, delay: activeOrHover ? 0.04 : 0 }}
          />
          {/* Subtotal dashed divider rule */}
          <motion.path
            d="M7 14.5h10"
            strokeDasharray="2.5 1.5"
            animate={{
              y: activeOrHover ? -1.5 : 0,
              strokeOpacity: activeOrHover ? 0.65 : 0.4,
            }}
            transition={ICON_SPRING}
          />
          {/* Total row: Label + Bold Amount */}
          <motion.g
            animate={{ y: activeOrHover ? -1.5 : 0 }}
            transition={ICON_SPRING}
          >
            <motion.path
              d="M7.5 17h3"
              animate={{ strokeOpacity: activeOrHover ? 0.9 : 0.65 }}
            />
            <motion.path
              d="M13.5 17h3.5"
              strokeWidth="2.25"
              animate={{ strokeOpacity: 1 }}
            />
          </motion.g>
        </svg>
      );

    case 'Work Orders':
      // Industrial Clipboard: Clamp lifts and Checkmark draws on interaction
      return (
        <svg {...commonSvgProps}>
          {/* Clipboard board */}
          <motion.rect
            x="5"
            y="5"
            width="14"
            height="16"
            rx="2"
            fill="none"
            animate={{ strokeOpacity: baseStrokeOpacity }}
            transition={ICON_SPRING}
          />
          {/* Lifting Top Clamp */}
          <motion.rect
            x="9"
            y="3"
            width="6"
            height="3.2"
            rx="1"
            fill="none"
            animate={{
              y: activeOrHover ? -1.75 : 0,
              scaleX: activeOrHover ? 1.1 : 1,
              strokeOpacity: 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
          {/* Hero Checkmark */}
          <motion.path
            d="M8.5 13l2.25 2.25 4.75-4.75"
            initial={false}
            animate={{
              pathLength: 1,
              scale: activeOrHover ? 1.12 : 1,
              strokeOpacity: 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={{
              pathLength: DRAW_TRANSITION,
              scale: ICON_SPRING,
            }}
          />
        </svg>
      );

    case 'Documents': {
      // Industrial Document Vault:
      // - When active (on /documents) or hovered: folder pocket opens and authentic document sheet rises out.
      // - The emerging document sheet has an opaque background (white in light mode, slate-800 in dark mode)
      //   to completely occlude and hide the folder tab lines behind it.
      // - The front pocket flap also has an opaque background so the lower part of the document remains neatly inside.
      // - When on /documents (isActive), it persists in the open state and does not collapse on mouse leave.
      const isDocOpen = isActive || isHovered;

      return (
        <svg {...commonSvgProps}>
          {/* Layer 1: Back folder body with top tab */}
          <motion.path
            d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h4.5l2 2H19.5a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5V6.5z"
            fill="none"
            animate={{
              strokeOpacity: isActive ? 1 : 0.85,
            }}
            transition={ICON_SPRING}
          />

          {/* Layer 2: Emerging Inner Document Sheet with Opaque Background (Occludes lines behind it) */}
          <motion.g
            initial={false}
            animate={{
              y: isDocOpen ? -5.5 : 4,
              opacity: isDocOpen ? 1 : 0,
              scale: isDocOpen ? 1 : 0.9,
              rotate: isDocOpen ? -2 : 0,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}
            transition={ICON_SPRING}
          >
            {/* Sheet body: Solid white in light mode, dark slate in dark mode */}
            <rect
              x="6"
              y="4.5"
              width="12"
              height="11"
              rx="1.5"
              className="fill-white dark:fill-slate-800"
              stroke="currentColor"
              strokeWidth="1.85"
            />
            {/* Crisp inspection clause lines on the document */}
            <motion.path
              d="M8.5 7.5h7 M8.5 10.5h4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{
                pathLength: isDocOpen ? 1 : 0,
                strokeOpacity: isDocOpen ? 0.95 : 0,
              }}
              transition={DRAW_TRANSITION}
            />
          </motion.g>

          {/* Layer 3: Hinged Front Folder Flap/Pocket with Opaque Background (Hides lower document) */}
          <motion.path
            d="M2.5 11h19v7a1.5 1.5 0 0 1-1.5 1.5h-16a1.5 1.5 0 0 1-1.5-1.5V11z"
            className="fill-white dark:fill-slate-800"
            animate={{
              scaleY: isDocOpen ? 0.68 : 1,
              skewX: isDocOpen ? -6 : 0,
              y: isDocOpen ? 2.5 : 0,
              strokeOpacity: isActive ? 1 : 0.9,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
            transition={ICON_SPRING}
          />
        </svg>
      );
    }

    case 'Certificates':
      // Shield with Rotating Starburst Seal
      return (
        <svg {...commonSvgProps}>
          {/* Outer shield silhouette */}
          <motion.path
            d="M12 3L5 6v6c0 5 3.5 8.5 7 9.5 3.5-1 7-4.5 7-9.5V6l-7-3z"
            fill="none"
            animate={{
              scale: activeOrHover ? 0.96 : 1,
              strokeOpacity: baseStrokeOpacity,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
          {/* Hero 4-point starburst emblem */}
          <motion.path
            d="M12 7l1.2 3.1 3.1 1.2-3.1 1.2L12 15.6l-1.2-3.1-3.1-1.2 3.1-1.2L12 7z"
            fill="none"
            animate={{
              rotate: activeOrHover ? 90 : 0,
              scale: activeOrHover ? 1.2 : 1,
              strokeOpacity: 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          />
        </svg>
      );

    case 'Reports':
      // Analytics Bars: Frame with 3 staggered bars
      return (
        <svg {...commonSvgProps}>
          {/* Outer chart frame */}
          <motion.rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2.5"
            fill="none"
            animate={{ strokeOpacity: activeOrHover ? 0.45 : baseStrokeOpacity }}
            transition={ICON_SPRING}
          />
          {/* Bar 1 (Left) */}
          <motion.rect
            x="6"
            y="10"
            width="2.75"
            height="8"
            rx="1"
            fill="none"
            animate={{
              scaleY: activeOrHover ? 1 : 0.65,
              strokeOpacity: 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
            transition={ICON_SPRING}
          />
          {/* Bar 2 (Center) */}
          <motion.rect
            x="10.625"
            y="6"
            width="2.75"
            height="12"
            rx="1"
            fill="none"
            animate={{
              scaleY: activeOrHover ? 0.62 : 0.95,
              strokeOpacity: 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
            transition={{ ...ICON_SPRING, delay: activeOrHover ? 0.03 : 0 }}
          />
          {/* Bar 3 (Right - Hero bar) */}
          <motion.rect
            x="15.25"
            y="7"
            width="2.75"
            height="11"
            rx="1"
            fill="none"
            animate={{
              scaleY: activeOrHover ? 1.05 : 0.75,
              strokeOpacity: 1,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
            transition={{ ...ICON_SPRING, delay: activeOrHover ? 0.06 : 0 }}
          />
        </svg>
      );

    case 'Audit':
      // Document Grid with Sweeping Magnifying Loupe
      return (
        <svg {...commonSvgProps}>
          {/* Document frame */}
          <motion.rect
            x="4"
            y="3"
            width="15"
            height="18"
            rx="2"
            fill="none"
            animate={{ strokeOpacity: baseStrokeOpacity }}
            transition={ICON_SPRING}
          />
          {/* Grid lines */}
          <motion.path
            d="M7 7.5h6 M7 11.5h4 M7 15.5h3"
            fill="none"
            animate={{ strokeOpacity: activeOrHover ? 0.45 : 0.7 }}
            transition={ICON_SPRING}
          />
          {/* Hero Magnifying Loupe */}
          <motion.g
            animate={{
              x: activeOrHover ? 2 : 0,
              y: activeOrHover ? -2.25 : 0,
              scale: activeOrHover ? 1.16 : 1,
              rotate: activeOrHover ? -10 : 0,
            }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            transition={ICON_SPRING}
          >
            <motion.circle
              cx="14"
              cy="13.5"
              r="3.25"
              fill="none"
              animate={{ strokeOpacity: 1 }}
              transition={ICON_SPRING}
            />
            <motion.path
              d="M16.4 15.9l2.6 2.6"
              fill="none"
              animate={{ strokeOpacity: 1 }}
            />
          </motion.g>
        </svg>
      );

    default:
      return null;
  }
}