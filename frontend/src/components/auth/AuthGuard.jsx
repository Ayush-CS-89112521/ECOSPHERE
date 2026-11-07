'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useClerkStatus } from './ClerkSafeProvider';

/**
 * Inner component that only mounts when Clerk is genuine and configured
 */
function ClerkAuthGate({ children, requireAuth = false }) {
  const { isLoaded, userId } = useAuth();
  const isSignedIn = isLoaded && !!userId;
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 600);

    if (isLoaded) {
      setIsChecking(false);
      clearTimeout(timer);

      if (requireAuth && !isSignedIn) {
        const returnTo = pathname !== '/sign-in' && pathname !== '/sign-up' 
          ? pathname 
          : '/';
        router.push('/sign-in?redirect_url=' + encodeURIComponent(returnTo));
      }
    }

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, requireAuth, router, pathname]);

  if ((!isLoaded || isChecking) && requireAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0e110f] text-[#f5f2ea] px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center flex flex-col items-center"
        >
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#d49a50]/20 border-t-[#d49a50] animate-spin" />
            <Globe className="w-5 h-5 text-[#d49a50] absolute" />
          </div>
          <h2 className="font-serif text-xl tracking-tight text-[#f5f2ea] mb-1">EcoSphere</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-[#a8a192]">
            Synchronizing telemetry...
          </p>
        </motion.div>
      </div>
    );
  }

  if (requireAuth && !isSignedIn && !isChecking) {
    return null;
  }

  return <>{children}</>;
}

/**
 * AuthGuard Component
 * Guest pages render immediately. Required authentication always fails closed.
 * If Clerk is active and requireAuth is true, routes through ClerkAuthGate.
 */
export default function AuthGuard({ children, requireAuth = false }) {
  const { isConfigured } = useClerkStatus();

  if (!requireAuth) {
    return <>{children}</>;
  }
  if (!isConfigured) {
    return <p role="alert" className="p-6 text-parchment-muted">Authentication is unavailable. This feature requires sign-in.</p>;
  }

  return <ClerkAuthGate requireAuth={requireAuth}>{children}</ClerkAuthGate>;
}
