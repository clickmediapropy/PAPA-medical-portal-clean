'use client';

import { useEffect } from 'react';
import { SignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/biomarkers');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <SignIn routing="path" path="/login" fallbackRedirectUrl="/biomarkers" />
      </div>
    </main>
  );
}
