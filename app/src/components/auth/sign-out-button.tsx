'use client';

import { SignOutButton } from '@clerk/nextjs';
import type { ReactNode } from 'react';

type SignOutTriggerProps = {
  children: ReactNode;
};

export function SignOutTrigger({ children }: SignOutTriggerProps) {
  return <SignOutButton>{children}</SignOutButton>;
}
