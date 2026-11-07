'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useClerkStatus } from '@/components/auth/ClerkSafeProvider';

function LiveClerkControls() {
  return (
    <>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8 ring-1 ring-white/20 hover:ring-[#d49a50] transition-all',
              userButtonPopoverCard: 'bg-[#141815] border border-white/10 text-[#f5f2ea] font-sans',
              userButtonPopoverActionButton: 'text-[#f5f2ea] hover:bg-white/10',
              userButtonPopoverActionButtonText: 'text-[#f5f2ea]',
              userButtonPopoverFooter: 'hidden',
            },
          }}
        />
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          className="text-xs font-mono uppercase tracking-[0.14em] text-[#a8a192] hover:text-[#f5f2ea] px-3 py-1.5 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="hidden sm:inline-block text-xs font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full border border-[#d49a50]/60 text-[#d49a50] hover:bg-[#d49a50] hover:text-[#0e110f] transition-all"
        >
          Join Observatory
        </Link>
      </SignedOut>
    </>
  );
}

function GuestControls() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="text-xs font-mono uppercase tracking-[0.14em] text-[#a8a192] hover:text-[#f5f2ea] px-2.5 py-1.5 transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="hidden sm:inline-block text-xs font-mono uppercase tracking-[0.14em] px-3.5 py-1.5 rounded-full border border-[#d49a50]/60 text-[#d49a50] hover:bg-[#d49a50] hover:text-[#0e110f] transition-all font-medium"
      >
        Join Observatory
      </Link>
    </div>
  );
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isConfigured } = useClerkStatus();

  const navigation = [
    { name: 'Field Dashboard', href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Planetary Spheres', href: '/worlds', current: pathname === '/worlds' },
    { name: 'Field Notes & Impact', href: '/achievements', current: pathname === '/achievements' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0e110f]/90 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="container-editorial py-3.5 sm:py-4 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="group flex items-baseline gap-1.5 text-lg sm:text-xl font-serif font-semibold tracking-tight text-[#f5f2ea] transition-opacity hover:opacity-90"
          >
            <span>EcoSphere</span>
            <span className="text-[11px] sm:text-xs font-mono tracking-widest text-[#d49a50] font-normal">
              / Obs.
            </span>
          </Link>

          {/* Archival Coordinate Tag - hides on small screens */}
          <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-[11px] font-mono text-[#a8a192]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8faf9a]" />
            <span>Delhi NCR &middot; 28.61&deg; N, 77.21&deg; E</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] lg:text-[12px] font-mono uppercase tracking-[0.16em]">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`transition-colors duration-200 py-1 ${
                item.current
                  ? 'text-[#d49a50] font-semibold border-b border-[#d49a50]'
                  : 'text-[#a8a192] hover:text-[#f5f2ea]'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth & Field Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isConfigured ? <LiveClerkControls /> : <GuestControls />}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#f5f2ea] hover:text-[#d49a50] transition-colors p-2 -mr-1"
            aria-label="Toggle menu"
            suppressHydrationWarning
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#141815] border-b border-white/[0.08] px-6 py-6 transition-all animate-fadeIn">
          <nav className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-xs font-mono uppercase tracking-[0.16em] py-2 transition-colors ${
                  item.current ? 'text-[#d49a50] font-semibold' : 'text-[#a8a192] hover:text-[#f5f2ea]'
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.08]">
              <Link
                href="/sign-in"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest text-[#f5f2ea] text-center border border-white/20 hover:border-white/40"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest bg-[#d49a50] text-[#0e110f] text-center font-semibold hover:bg-[#e0ad68]"
              >
                Join Observatory
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
