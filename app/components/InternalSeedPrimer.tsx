'use client';

import { useEffect } from 'react';
import { primeInternalStore } from '@/app/loadInternalSeed';

export function InternalSeedPrimer() {
  useEffect(() => {
    primeInternalStore();
  }, []);

  return null;
} 