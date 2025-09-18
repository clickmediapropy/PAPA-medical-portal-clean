import Link from 'next/link';
import type { ReactNode } from 'react';
import { MobileNav } from '@/components/layout/mobile-nav';

const navItems = [
  { href: '/dashboard', label: 'Resumen' },
  { href: '/laboratory', label: 'Laboratorio' },
  { href: '/biomarkers', label: 'Biomarcadores' },
  { href: '/care-plan', label: 'Plan de Cuidados' },
  { href: '/timeline', label: 'Cronología' },
  { href: '/medications', label: 'Medicaciones' },
  { href: '/upload', label: 'Subir documento' },
];

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Temporarily disabled authentication to avoid middleware issues
  // const user = await currentUser();

  // if (!user) {
  //   redirect('/login');
  // }

  // const email = user.emailAddresses[0]?.emailAddress ?? 'usuario';
  const email = 'usuario@demo.com'; // Temporary demo user

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <MobileNav />
            <Link href="/dashboard" className="text-base sm:text-lg font-semibold text-slate-900">
              Portal Médico v2
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-2 text-sm font-medium text-slate-600 md:flex lg:gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-1 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User info - hidden on mobile, shown on desktop */}
          <div className="hidden text-sm text-slate-600 md:block">
            {email}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}