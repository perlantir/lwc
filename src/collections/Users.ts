import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminField, isAdminOrSelf } from '../access';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 8 * 60 * 60, // 8h
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15min
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'active'],
    group: 'Admin',
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'viewer',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Coach', value: 'coach' },
        { label: 'Viewer', value: 'viewer' },
      ],
      access: {
        update: isAdminField,
        create: isAdminField,
      },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, access: { update: isAdminField } },
    {
      name: 'totpEnrolled',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: '2FA enrollment status. Set on first successful TOTP verification.' },
      access: { update: isAdminField },
    },
    {
      name: 'totpSecret',
      type: 'text',
      admin: {
        hidden: true,
        description: 'TOTP secret. Stored encrypted at rest by Payload via PAYLOAD_SECRET.',
      },
      access: {
        read: () => false,
        update: isAdminField,
      },
    },
  ],
};
