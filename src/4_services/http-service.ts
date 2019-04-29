export const headerJson = {'Content-Type': 'application/json'};
export const headerAuth = (token: string) => ({Authorization : `Bearer ${token}`});