'use client';

import React, { createContext, useContext } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const ClerkStatusContext = createContext({ isConfigured: false });

export const useClerkStatus = () => useContext(ClerkStatusContext);

/**
 * Checks if a Clerk publishable key is genuine and configured
 * (i.e., not the dummy pk_test_...example.com placeholder)
 */
export function isRealClerkKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (key.includes('example.com')) return false;
  if (key.includes('your_clerk_key')) return false;
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false;
  return key.length > 35;
}

export default function ClerkSafeProvider({ children, publishableKey }) {
  const isConfigured = isRealClerkKey(publishableKey);

  if (!isConfigured) {
    // When no genuine key is present, provide a safe fallback context
    // This completely prevents the browser from trying to download clerk.browser.js from clerk.example.com
    return (
      <ClerkStatusContext.Provider value={{ isConfigured: false }}>
        {children}
      </ClerkStatusContext.Provider>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkStatusContext.Provider value={{ isConfigured: true }}>
        {children}
      </ClerkStatusContext.Provider>
    </ClerkProvider>
  );
}
