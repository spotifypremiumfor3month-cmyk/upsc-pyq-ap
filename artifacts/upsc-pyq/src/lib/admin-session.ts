const KEY = 'admin_token';

export function saveAdminToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(KEY);
}

export function getAdminToken(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}
