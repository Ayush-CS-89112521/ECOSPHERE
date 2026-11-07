'use client';

import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export function useAccountDatabase() {
  const { getToken, isLoaded, userId } = useAuth();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const client = useMemo(() => {
    if (!isLoaded || !userId || !url || !key) return null;
    return createClient(url, key, { accessToken: getToken });
  }, [getToken, isLoaded, userId, url, key]);

  return { client, isLoaded, userId };
}
