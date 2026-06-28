export interface DecodedToken {
  sub?: string;
  email?: string;
  role?: string;
  roles?: string[];
  name?: string;
  exp?: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    
    // Standardize claims for role-based routes
    const roleValue = parsed.role || (Array.isArray(parsed.roles) ? parsed.roles[0] : parsed.roles) || 'STUDENT';
    
    return {
      sub: parsed.sub || parsed.email,
      email: parsed.email || parsed.sub || parsed.username,
      role: String(roleValue).toUpperCase(),
      name: parsed.name || parsed.sub || 'User',
      exp: parsed.exp
    };
  } catch (error) {
    console.error('Failed to decode JWT token', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}
