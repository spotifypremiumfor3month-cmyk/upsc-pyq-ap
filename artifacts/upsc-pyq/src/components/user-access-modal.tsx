import React from 'react';
import { X, Users, ShieldCheck, Mail, Calendar, Clock, LogIn } from 'lucide-react';
import { useAuth, useRegisteredUsersList } from '@/lib/auth-context';

export function UserAccessModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, signInWithGoogle } = useAuth();
  const { usersList, loadingList } = useRegisteredUsersList();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Site Access & User Log</h3>
              <p className="text-xs text-muted-foreground">Users who logged in via Gmail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!user ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-foreground">Sign in required</h4>
                <p className="text-xs text-muted-foreground">
                  You need to sign in with your Google account to view the active users list and track site access.
                </p>
              </div>
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all"
              >
                <LogIn className="h-4 w-4" />
                Sign in with Gmail
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified Creator Access</span>
                </div>
                <span className="text-xs font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                  {usersList.length} User{usersList.length !== 1 ? 's' : ''} Recorded
                </span>
              </div>

              {loadingList ? (
                <p className="text-xs text-muted-foreground text-center py-6">Loading site users log…</p>
              ) : usersList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground space-y-2">
                  <Mail className="h-8 w-8 mx-auto opacity-40" />
                  <p className="text-xs">No user logins recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Recent Gmail Logins
                  </p>
                  {usersList.map((u) => (
                    <div
                      key={u.uid}
                      className="flex items-center justify-between p-3 rounded-xl border bg-background hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt={u.displayName || 'User'}
                            className="h-9 w-9 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-secondary text-foreground font-bold flex items-center justify-center text-sm border">
                            {(u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            {u.displayName || 'Google User'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                          <Clock className="h-3 w-3 text-primary" />
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-secondary/20 text-center text-xs text-muted-foreground">
          Real-time access security provided via Firebase Authentication & Firestore
        </div>
      </div>
    </>
  );
}
