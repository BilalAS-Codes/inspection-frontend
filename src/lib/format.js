/**
 * Formats date into British English standard: dd MMM yyyy (e.g. 23 Oct 2026).
 *
 * @param {string | Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch (err) {
    return '—';
  }
}

/**
 * Formats datetime with hour and minutes: dd MMM yyyy HH:mm.
 *
 * @param {string | Date} dateInput
 * @returns {string}
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  } catch (err) {
    return '—';
  }
}

/**
 * Formats numeric amount into Saudi Riyal (SAR) currency.
 * Always renders with two decimal fraction digits.
 *
 * @param {number | string} amount
 * @returns {string}
 */
export function formatMoney(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Computes human-friendly relative expiration labels.
 * (e.g. "expires in 5 days" or "expired 1 day ago")
 *
 * @param {string | Date} dateInput
 * @returns {{ text: string, isExpired: boolean, isUrgent: boolean, days: number }}
 */
export function formatRelativeExpiry(dateInput) {
  if (!dateInput) return { text: 'No Expiry', isExpired: false, isUrgent: false, days: 9999 };
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return {
      text: abs === 1 ? 'expired 1 day ago' : `expired ${abs} days ago`,
      isExpired: true,
      isUrgent: true,
      days: diffDays
    };
  } else if (diffDays === 0) {
    return { text: 'expires today', isExpired: false, isUrgent: true, days: 0 };
  } else if (diffDays === 1) {
    return { text: 'expires in 1 day', isExpired: false, isUrgent: true, days: 1 };
  } else {
    return {
      text: `expires in ${diffDays} days`,
      isExpired: false,
      isUrgent: diffDays <= 7,
      days: diffDays
    };
  }
}
