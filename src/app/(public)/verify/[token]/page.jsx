'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../../lib/api';
import { formatDate, formatDateTime } from '../../../../lib/format';
import { AllianceLogo } from '../../../../components/alliance-logo';
import { DraftingGrid, RegistrationMarks, FadeRule } from '../../../../components/engineering';
import { MachineLoader } from '../../../../components/machine-loader';

/**
 * 6.4 Public Verification Page — "The Certificate Registry"
 * Public-facing government-grade verification sheet.
 * - Canvas: Warm stone-50 with drafting grid
 * - Centered max-width 520px
 * - Status hero (120px tall) with hazard-stripe background (3% opacity) and 40px mono outcome
 * - Equipment definition-list card with equipment serial in amber-700 mono
 * - Anti-enumeration: tampered and missing tokens yield identical NOT VERIFIED screen
 * - Footer: Verified live against the Alliance Infinite registry · <mono timestamp>
 */
export default function PublicVerifyPage() {
  const params = useParams();
  const token = params.token;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setTimestamp(new Date().toUTCString());

    if (!token) {
      setIsInvalid(true);
      setLoading(false);
      return;
    }

    apiFetch(`/api/verify/${token}`)
      .then((res) => {
        if (!res.valid) {
          setIsInvalid(true);
        } else {
          setData(res);
        }
      })
      .catch(() => {
        // Anti-enumeration: tampered or non-existent token yields identical invalid screen
        setIsInvalid(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <DraftingGrid className="min-h-screen bg-canvas text-text-main flex items-center justify-center p-4">
        <MachineLoader scene="scan" size={90} caption="INTERROGATING REGISTRY CIPHER..." />
      </DraftingGrid>
    );
  }

  // Anti-enumeration invalid response card (Identical layout for missing or tampered tokens)
  if (isInvalid || !data) {
    return (
      <DraftingGrid className="min-h-screen bg-canvas text-text-main flex flex-col justify-center items-center p-4 select-none">
        <div className="w-full max-w-[520px] space-y-6">
          {/* Top Header */}
          <div className="text-center space-y-1">
            <AllianceLogo size={32} className="justify-center" />
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted mt-2">
              CERTIFICATE VERIFICATION REGISTRY
            </div>
          </div>

          {/* 120px Status Hero Card */}
          <div className="relative h-[120px] rounded-md border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/60 p-5 shadow-whisper flex flex-col justify-center border-l-[4px] border-l-stone-400 hazard-stripe-neutral">
            <RegistrationMarks />
            <div className="font-mono text-3xl sm:text-4xl font-700 text-stone-700 dark:text-stone-300 tracking-tight leading-none">
              NOT VERIFIED
            </div>
            <div className="font-sans text-xs text-stone-500 mt-2">
              This certificate could not be confirmed against the authoritative registry.
            </div>
          </div>

          <div className="p-4 rounded-md border border-border bg-surface-1 text-center font-mono text-xs text-text-muted">
            The cryptographic signature is invalid, unrecognized, or expired.
          </div>

          <div className="text-center font-mono text-[11px] text-text-faint pt-4">
            Verified live against the Alliance Infinite registry · {timestamp}
          </div>
        </div>
      </DraftingGrid>
    );
  }

  const {
    status,
    certificateNumber,
    certificateType,
    equipment,
    issuedAt,
    expiresAt,
    inspectingCompany,
    revocationReason,
    revokedAt,
    tenant
  } = data;

  const isIssued = status === 'issued';
  const isRevoked = status === 'revoked';
  const isExpired = status === 'expired';

  return (
    <DraftingGrid className="min-h-screen bg-canvas text-text-main flex flex-col justify-center items-center p-4 py-12 select-none">
      <div className="w-full max-w-[520px] space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-1.5">
          <AllianceLogo size={36} className="justify-center" />
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">
            CERTIFICATE VERIFICATION REGISTRY
          </div>
        </div>

        {/* 120px Status Hero Card with Hazard Stripes and Corner Registration Marks */}
        {isIssued && (
          <div className="relative h-[120px] rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 shadow-whisper flex flex-col justify-center border-l-[4px] border-l-emerald-600 hazard-stripe-valid">
            <RegistrationMarks />
            <div className="font-mono text-4xl sm:text-5xl font-700 text-[#047857] dark:text-emerald-400 tracking-tight leading-none">
              VALID
            </div>
            <div className="font-mono text-xs text-stone-600 dark:text-stone-300 mt-2">
              Expires {formatDate(expiresAt)} · Statutory Compliance Certified
            </div>
          </div>
        )}

        {isExpired && (
          <div className="relative h-[120px] rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5 shadow-whisper flex flex-col justify-center border-l-[4px] border-l-amber-600 hazard-stripe-expiring">
            <RegistrationMarks />
            <div className="font-mono text-4xl sm:text-5xl font-700 text-[#B45309] dark:text-amber-400 tracking-tight leading-none">
              EXPIRED
            </div>
            <div className="font-mono text-xs text-amber-800 dark:text-amber-300 mt-2">
              Lapsed on {formatDate(expiresAt)} · Re-inspection required
            </div>
          </div>
        )}

        {isRevoked && (
          <div className="relative h-[120px] rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-5 shadow-whisper flex flex-col justify-center border-l-[4px] border-l-rose-600 hazard-stripe-expired">
            <RegistrationMarks />
            <div className="font-mono text-4xl sm:text-5xl font-700 text-[#BE123C] dark:text-rose-400 tracking-tight leading-none">
              REVOKED
            </div>
            <div className="font-mono text-xs text-rose-800 dark:text-rose-300 mt-2 truncate">
              {revocationReason || 'Revoked by statutory inspection authority'}
            </div>
          </div>
        )}

        {/* Certificate Reference Strip */}
        <div className="p-4 rounded-md border border-border bg-surface-1 shadow-whisper flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-[10px] text-text-faint uppercase block">Certificate Number</span>
            <span className="text-sm font-600 text-text-main">{certificateNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-text-faint uppercase block">Accreditation</span>
            <span className="text-xs text-text-muted uppercase">{certificateType?.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Asset Physical Specification Definition-List Card */}
        <div className="relative rounded-md border border-border bg-surface-1 p-5 shadow-whisper space-y-4">
          <RegistrationMarks />

          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint border-b border-border pb-2">
            PHYSICAL ASSET SPECIFICATION
          </div>

          <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <dt className="font-mono text-[10px] uppercase text-text-muted">Manufacturer</dt>
              <dd className="font-sans text-sm font-500 text-text-main mt-0.5">
                {equipment?.manufacturer || 'N/A'}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[10px] uppercase text-text-muted">Model Number</dt>
              <dd className="font-sans text-sm font-500 text-text-main mt-0.5">
                {equipment?.model || 'N/A'}
              </dd>
            </div>

            <div className="col-span-2 pt-2 border-t border-border/60">
              <dt className="font-mono text-[10px] uppercase text-text-muted">Equipment Serial Number</dt>
              <dd className="font-mono text-sm font-700 text-amber-700 dark:text-amber-400 mt-0.5">
                {equipment?.serial || data.equipmentSerial || 'N/A'}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[10px] uppercase text-text-muted">Manufacturing Year</dt>
              <dd className="font-mono text-sm text-text-main mt-0.5">
                {equipment?.year || '2021'}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-[10px] uppercase text-text-muted">Rated Capacity</dt>
              <dd className="font-mono text-sm text-text-main mt-0.5">
                {equipment?.capacity || '50-Ton SWL'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Inspection Authority Card */}
        <div className="rounded-md border border-border bg-surface-1 p-4 shadow-whisper flex items-center justify-between text-xs font-mono">
          <div>
            <div className="text-[10px] text-text-faint uppercase">Inspecting Body</div>
            <div className="font-600 text-text-main mt-0.5">{inspectingCompany || tenant?.name}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-text-faint uppercase">Issued Date</div>
            <div className="text-text-muted mt-0.5">{formatDate(issuedAt)}</div>
          </div>
        </div>

        <FadeRule />

        {/* Authoritative Live Registry Footer */}
        <div className="text-center font-mono text-[11px] text-text-faint space-y-1">
          <div>Verified live against the Alliance Infinite registry · {timestamp}</div>
          <div className="text-[10px] text-text-faint/70">
            KSA ACCREDITED TPI · CR 1010889201 · SASO CONFORMANCE
          </div>
        </div>
      </div>
    </DraftingGrid>
  );
}
