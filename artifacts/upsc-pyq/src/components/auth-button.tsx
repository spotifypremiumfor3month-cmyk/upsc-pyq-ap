import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, Users, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserAccessModal } from './user-access-modal';

const ADMIN_EMAIL = 'spotifypremiumfor3month@gmail.com';

export function AuthButton() {
  const { user, loading, signInWithGoogle, signOutUser, registeredUsersCount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const msg: string = err?.message || err?.code || String(err);
      setAuthError(msg);
    }
  };

  const isAdmin = Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  if (loading) {
    return <div className="h-9 w-24 bg-secondary animate-pulse rounded-xl" />;
  }

  if (!user) {
    return (
      <>
        {authError && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full mx-4 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-700 rounded-xl px-4 py-3 text-xs text-red-700 dark:text-red-300 shadow-lg">
            <strong>Sign-in error:</strong> {authError}
          </div>
        )}
        <button
          onClick={handleSignIn}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow transition-all active:scale-95"
          title="Sign in with Gmail"
        >
          <svg className="h-3.5 w-3.5 bg-white rounded-full p-px flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign in</span>
        </button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Users Log button visible strictly to admin */}
      {isAdmin && (
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border/60 transition-all"
          title="View users who logged into this site"
        >
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Users Log</span>
          <span className="bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-full text-[10px]">
            {registeredUsersCount}
          </span>
        </button>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 p-1 pr-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 transition-colors"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="h-7 w-7 rounded-lg object-cover border border-primary/30"
            />
          ) : (
            <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-bold text-foreground max-w-[100px] truncate hidden md:inline">
            {user.displayName || user.email?.split('@')[0]}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-card border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-2 space-y-1">
            {/* User profile summary */}
            <div className="px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/40 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="truncate">{user.displayName || 'Signed In'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate font-mono">{user.email}</p>
            </div>

            {/* Access log action - strictly for admin */}
            {isAdmin && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-secondary text-xs font-semibold text-foreground transition-colors text-left"
              >
                <Users className="h-4 w-4 text-primary" />
                <span className="flex-1">Who is using site ({registeredUsersCount})</span>
              </button>
            )}

            <div className="border-t pt-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOutUser();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-xs font-semibold text-red-500 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {isAdmin && <UserAccessModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
