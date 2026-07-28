// Admin auth — pure client-side password check, no network required.
// Token is stored under 'admin_token' so api.ts can read it for API calls.

const STORAGE_KEY = 'admin_token';

function getPassword(): string {
  return (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'upsc@admin';
}

export function adminLogin(password: string): boolean {
  if (password !== getPassword()) return false;
  // Token format: <timestamp>.admin.authenticated
  // The Express requireAdmin middleware accepts this format.
  const token = `${Date.now()}.admin.authenticated`;
  localStorage.setItem(STORAGE_KEY, token);
  return true;
}

export function isAdminLoggedIn(): boolean {
  const val = localStorage.getItem(STORAGE_KEY);
  if (!val) return false;
  const ts = parseInt(val.split('.')[0], 10);
  if (isNaN(ts)) return false;
  return Date.now() - ts < 48 * 60 * 60 * 1000;
}

export function adminLogout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
