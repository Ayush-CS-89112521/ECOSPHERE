'use client'

import { SignUp } from "@clerk/nextjs";
import { ArrowLeft, KeyRound, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useClerkStatus } from './ClerkSafeProvider';

export default function ClerkSignUp() {
  const { isConfigured } = useClerkStatus();

  return (
    <div className="min-h-screen bg-[#0e110f] text-[#f5f2ea] flex items-center justify-center p-4 relative selection:bg-[#d49a50] selection:text-[#0e110f]">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(212, 154, 80, 0.12) 0%, transparent 60%)'
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#a8a192] hover:text-[#f5f2ea] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Observatory</span>
          </Link>
        </div>

        {/* Card Header */}
        <div className="mb-6">
          <div className="font-mono text-xs uppercase tracking-widest text-[#d49a50] mb-2">
            Field Registration // Obs.
          </div>
          <h1 className="font-serif text-3xl font-normal text-[#f5f2ea]">
            Join the Observatory
          </h1>
          <p className="text-xs text-[#a8a192] mt-1 font-sans">
            Enlist as a civic atmospheric observer to track local stations and log impact reports.
          </p>
        </div>

        {/* Dynamic Auth or Guest Box */}
        {isConfigured ? (
          <div className="bg-[#141815] border border-[#2a3028] p-6 rounded-none shadow-2xl">
            <SignUp
              routing="hash"
              signInUrl="/sign-in"
              forceRedirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full flex justify-center",
                  card: "bg-transparent shadow-none mx-auto w-full",
                  headerTitle: "text-2xl font-serif text-[#f5f2ea] text-center",
                  headerSubtitle: "text-[#a8a192] text-xs text-center",
                  formButtonPrimary: "bg-[#d49a50] hover:bg-[#e0ad68] text-[#0e110f] font-mono text-xs uppercase tracking-wider py-3 font-semibold",
                  formFieldInput: "bg-[#0e110f] border border-[#2a3028] text-[#f5f2ea] focus:border-[#d49a50]",
                  formFieldLabel: "text-[#a8a192] text-xs font-mono uppercase",
                  footerActionLink: "text-[#d49a50] hover:underline text-xs",
                }
              }}
            />
          </div>
        ) : (
          <div className="bg-[#141815] border border-[#2a3028] p-6 sm:p-8 rounded-none shadow-2xl">
            <div className="flex items-center gap-2.5 text-xs font-mono text-[#d49a50] mb-3 uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>Observatory Open Access</span>
            </div>
            <p className="text-sm text-[#f5f2ea]/90 leading-relaxed font-sans mb-4">
              Registration is optional. All live ground stations, air quality alerts, and planetary biomes can be explored immediately.
            </p>

            <div className="bg-[#0e110f] border border-[#2a3028] p-3 text-[11px] font-mono text-[#a8a192] mb-6">
              <span className="block text-[10px] uppercase text-[#d49a50] mb-1">To connect live Clerk user registration:</span>
              Paste your key in <code className="text-[#f5f2ea]">.env.local</code>:
              <div className="text-[#f5f2ea] mt-1 break-all">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</div>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3.5 bg-[#d49a50] hover:bg-[#e0ad68] text-[#0e110f] font-mono text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <span>Launch Field Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <p className="text-center mt-6 text-xs font-mono text-[#a8a192]">
          Already registered?{' '}
          <Link href="/sign-in" className="text-[#d49a50] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
