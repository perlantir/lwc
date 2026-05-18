import type { Access, FieldAccess } from 'payload';

export type Role = 'admin' | 'coach' | 'viewer';

interface UserLike {
  role?: Role;
  id?: string | number;
}

export const hasRole =
  (...allowed: Role[]): Access =>
  ({ req }) => {
    const user = req.user as UserLike | null;
    if (!user?.role) return false;
    return allowed.includes(user.role);
  };

export const isAdmin: Access = ({ req }) => (req.user as UserLike | null)?.role === 'admin';

export const isAdminOrCoach: Access = ({ req }) => {
  const role = (req.user as UserLike | null)?.role;
  return role === 'admin' || role === 'coach';
};

export const isAnyAuthenticated: Access = ({ req }) => Boolean(req.user);

export const isPublic: Access = () => true;

export const isAdminField: FieldAccess = ({ req }) =>
  (req.user as UserLike | null)?.role === 'admin';

export const isAdminOrSelf: Access = ({ req, id }) => {
  const user = req.user as UserLike | null;
  if (!user) return false;
  if (user.role === 'admin') return true;
  return id !== undefined && String(id) === String(user.id);
};

export const readPublishedOrAdmin: Access = ({ req }) => {
  const role = (req.user as UserLike | null)?.role;
  if (role === 'admin' || role === 'coach' || role === 'viewer') return true;
  return { status: { equals: 'published' } };
};
