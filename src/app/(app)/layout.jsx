'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { AppShell } from '../../components/app-shell';
import { MachineLoader } from '../../components/machine-loader';

export default function AuthenticatedLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch('/api/auth/me')
      .then((res) => {
        if (mounted) {
          setUser(res.user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          router.push('/login');
        }
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[--canvas] flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <MachineLoader scene="crane" size={160} caption="CALIBRATING WORKSPACE…" />
        </div>
      </div>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
