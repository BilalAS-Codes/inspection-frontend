'use client';

import React, { useState, useEffect } from 'react';
import { CraneScene } from './scenes/crane';
import { GearsScene } from './scenes/gears';
import { PropellerScene } from './scenes/propeller';
import { ConveyorScene } from './scenes/conveyor';
import { PressScene } from './scenes/press';
import { ScanScene } from './scenes/scan';
import { CertificateScene } from './scenes/certificate';

const SCENES = {
  crane: CraneScene,
  gears: GearsScene,
  propeller: PropellerScene,
  conveyor: ConveyorScene,
  press: PressScene,
  scan: ScanScene,
  certificate: CertificateScene,
};

/**
 * Industrial MachineLoader component.
 * Replaces generic spinners with precision technical drawing machines.
 *
 * @param {object} props
 * @param {'crane' | 'gears' | 'propeller' | 'conveyor' | 'press' | 'scan' | 'certificate'} props.scene
 * @param {number} [props.size=64]
 * @param {string} [props.caption]
 * @param {boolean} [props.isDone=false]
 * @param {string} [props.className='']
 */
export function MachineLoader({
  scene = 'conveyor',
  size = 96,
  caption,
  isDone = false,
  disableTimeout = false,
  className = ''
}) {
  const [isDelayed, setIsDelayed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // 1. Check reduced-motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    // Only trigger timeout message for in-flight requests that are neither done nor disabled
    if (isDone || disableTimeout) {
      setIsDelayed(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsDelayed(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isDone, disableTimeout]);

  const SceneComponent = SCENES[scene] || ConveyorScene;

  if (isDelayed) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-center select-none ${className}`}>
        <div style={{ width: size, height: size }} className="relative flex items-center justify-center opacity-40 mb-2">
          <SceneComponent isReducedMotion={true} />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
          QUERY TAKING LONGER THAN EXPECTED — STILL WORKING
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={caption || `${scene} machine loading`}
      className={`flex flex-col items-center justify-center gap-2 select-none ${className}`}
    >
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center transition-transform duration-120"
      >
        <SceneComponent isReducedMotion={reducedMotion || isDone} />
      </div>

      {caption && (
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
          {caption}
        </span>
      )}
    </div>
  );
}
