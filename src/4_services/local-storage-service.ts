const LOCAL_STORAGE_KEY = {
  token: 'token',
};

// ===== AUTHENTICATION TOKEN OF USER
export function storeToken(token: string): void {
  localStorage.setItem(LOCAL_STORAGE_KEY.token, token);
}
export function removeToken(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY.token);
}
export function readToken(): string {
  return localStorage.getItem(LOCAL_STORAGE_KEY.token) || '';
}
