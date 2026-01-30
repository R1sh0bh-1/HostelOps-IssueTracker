export type UserRole = 'student' | 'maintenance' | 'management' | 'warden';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Extended fields we keep in req.user for convenience (not part of JWT payload necessarily)
export interface AuthUserWithLocation extends AuthUser {
  hostel?: string;
  block?: string;
  room?: string;
}

