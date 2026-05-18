import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access';

export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  admin: {
    useAsTitle: 'event',
    defaultColumns: ['event', 'user', 'createdAt'],
    group: 'Admin',
  },
  access: {
    read: isAdmin,
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'event', type: 'text', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'detail', type: 'json' },
    { name: 'ipHash', type: 'text' },
  ],
};
