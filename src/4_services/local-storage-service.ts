const LOCAL_STORAGE_KEY = {
  token: 'token',
};

const getItem = (key: string): string | null => localStorage.getItem(key);
const setItem = (key: string, value: string) => localStorage.setItem(key, value);
const removeItem = (key: string) => localStorage.removeItem(key);

// ===== AUTHENTICATION TOKEN OF USER
export const storeToken = (token: string) => setItem(LOCAL_STORAGE_KEY.token, token);
export const removeToken = () => removeItem(LOCAL_STORAGE_KEY.token);
export const readToken = (): string => getItem(LOCAL_STORAGE_KEY.token) || '';
