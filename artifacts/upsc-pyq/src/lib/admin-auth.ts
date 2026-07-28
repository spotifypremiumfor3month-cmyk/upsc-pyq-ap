// Simple client-side admin auth — no API calls, no network required.
// Password is checked directly in the browser.

const STORAGE_KEY = 'upsc_admin_v2';
const DEFAULT_PASSWORD = 'upsc@admin';

function getPassword(): string {
  // Allow override via build-time env var
  return (import.meta.env.VITE_ADMIN_PASSWORD as string) || DEFAULT_PASSWORD;
}

export function adminLogin(password: string): boolean {
  if (password === getPassword()) {
    const token = `${Date.now()}.admin.authenticated`;
    localStorage.setItem(STORAGE_KEY, token);
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  const val = localStorage.getItem(STORAGE_KEY);
  if (!val) return false;
  // Token format: <timestamp>.admin.authenticated — expires after 48 h
  const ts = parseInt(val.split('.')[0], 10);
  if (isNaN(ts)) return false;
  const age = Date.now() - ts;
  return age < 48 * 60 * 60 * 1000;
}

export function adminLogout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
