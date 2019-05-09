export const headerJson = {'Content-Type': 'application/json'};
export function headerAuth(token: string) {
  return {
    Authorization : `Bearer ${token}`,
  };
}