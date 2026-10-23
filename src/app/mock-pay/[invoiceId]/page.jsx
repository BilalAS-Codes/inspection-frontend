'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { formatMoney } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { MachineLoader } from '../../../components/machine-loader';
import { DraftingGrid } from '../../../components/engineering/drafting-grid';
import { RegistrationMarks } from '../../../components/engineering/registration-marks';
import { AllianceLogo } from '../../../components/alliance-logo';
import { CreditCard, CheckCircle2, XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function MockPayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const invoiceId = params.invoiceId;
  const paymentId = searchParams.get('pid');

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [resultStatus, setResultStatus] = useState(null);

  useEffect(() => {
    if (!invoiceId) return;

    apiFetch(`/api/invoices/${invoiceId}`)
      .then((res) => {
        setInvoice(res.invoice);
      })
      .catch((err) => {
        toast.error('Invoice details could not be loaded.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [invoiceId]);

  const handleSimulatePayment = async (status) => {
    setProcessing(true);

    try {
      // Use paymentId as the stable idempotencyKey to test double-click idempotency
      const idempotencyKey = paymentId || `mock_key_${invoiceId}`;

      const res = await apiFetch('/api/webhooks/mock-pay', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId,
          paymentId,
          status,
          idempotencyKey
        })
      });

      if (res.idempotent) {
        toast.info('Already processed (idempotent). Work order was previously generated.');
        setResultStatus('idempotent');
      } else if (res.status === 'succeeded') {
        toast.success(`Payment received. Work order ${res.workOrderNumber} created!`);
        setResultStatus('succeeded');
        setTimeout(() => {
          router.push('/invoices');
        }, 2000);
      } else {
        toast.error('Payment simulation marked as failed.');
        setResultStatus('failed');
      }
    } catch (err) {
      toast.error(err.message || 'Payment simulation failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[--canvas] flex items-center justify-center p-6 relative">
        <DraftingGrid opacity={0.3} size={24} />
        <MachineLoader scene="gears" size={160} caption="CONNECTING TO MADA GATEWAY…" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[--canvas] flex items-center justify-center p-6 relative">
        <DraftingGrid opacity={0.3} size={24} />
        <div className="relative max-w-md w-full rounded-md border border-[--border] bg-[--surface-1] p-6 text-center space-y-3 shadow-whisper">
          <RegistrationMarks />
          <h1 className="font-sans text-base font-600 text-[--text]">Invoice Not Found</h1>
          <p className="text-xs text-[--text-2]">The referenced invoice does not exist or has expired.</p>
        </div>
      </div>
    );
  }

  const client = invoice.client_jsonb || {};

  return (
    <div className="min-h-screen bg-[--canvas] flex flex-col justify-center items-center p-6 relative">
      <DraftingGrid opacity={0.3} size={24} />

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Gateway Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1">
            <AllianceLogo iconOnly size={28} />
          </div>
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[--text-2]">
            SIMULATED CLEARING HOUSE · SAUDI REGIONAL MADA
          </div>
          <h1 className="font-sans text-xl font-600 tracking-tight text-[--text]">
            Payment Settlement Gateway
          </h1>
        </div>

        {/* Invoice Summary Card */}
        <div className="relative rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] p-6 shadow-elevation space-y-5">
          <RegistrationMarks />

          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Tax Invoice Ref</div>
              <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{invoice.invoice_number}</div>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="space-y-2.5 text-xs font-sans">
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
              <span>Billed Entity</span>
              <span className="font-semibold text-slate-900 dark:text-white">{client.client_name || 'Client'}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
              <span>Net Subtotal</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">{formatMoney(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
              <span>VAT (15%)</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">{formatMoney(invoice.vat_amount)}</span>
            </div>
            <div className="flex justify-between py-2.5 border-t border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white">
              <span>Total Payable</span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white">{formatMoney(invoice.total)}</span>
            </div>
          </div>

          {/* Demonstration Notice */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Idempotency Demonstration Test</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Clicking <strong>&ldquo;Authorize & Settle Payment&rdquo;</strong> triggers instant Work Order generation. A second click proves idempotent rejection with zero duplicate records.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleSimulatePayment('succeeded')}
              disabled={processing || invoice.status === 'paid'}
              className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-sans font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <MachineLoader scene="gears" size={20} />
                  <span>COMMITTING TRANSACTION…</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Authorize & Settle Payment (Creates Work Order)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSimulatePayment('failed')}
              disabled={processing || invoice.status === 'paid'}
              className="w-full h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-sans font-medium text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4 text-rose-500" />
              <span>Simulate Gateway Failure</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/invoices')}
            className="text-xs text-[--text-2] hover:text-[--text] inline-flex items-center gap-1.5 font-mono"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>RETURN TO INVOICES</span>
          </button>
        </div>
      </div>
    </div>
  );
}
