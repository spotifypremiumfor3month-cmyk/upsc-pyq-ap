import { useState } from 'react';
import { useLocation } from 'wouter';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { saveAdminToken } from '@/lib/admin-session';

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await api.admin.login(password);
      saveAdminToken(token);
      navigate('/admin/posts');
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">UPSC Study Studio Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Default password: <code className="bg-secondary px-1.5 py-0.5 rounded">upsc@admin</code><br />
          Set <code className="bg-secondary px-1.5 py-0.5 rounded">ADMIN_PASSWORD</code> env var to change it.
        </p>
      </div>
    </div>
  );
}
