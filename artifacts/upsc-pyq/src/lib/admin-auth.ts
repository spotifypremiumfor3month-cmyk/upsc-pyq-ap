// Admin auth — calls the API server to verify password and get a signed token.

const STORAGE_KEY = 'admin_token';

export async function adminLogin(password: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const { token } = await res.json();
    if (!token) return false;
    localStorage.setItem(STORAGE_KEY, token);
    return true;
  } catch {
    return false;
  }
}

export function isAdminLoggedIn(): boolean {
  const val = localStorage.getItem(STORAGE_KEY);
  if (!val) return false;
  // Token format from server: <timestamp>.<hmac> — expires after 48 h
  const ts = parseInt(val.split('.')[0], 10);
  if (isNaN(ts)) return false;
  return Date.now() - ts < 48 * 60 * 60 * 1000;
}

export function adminLogout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
