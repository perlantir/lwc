import type { ImportMap } from 'payload';
import { VercelBlobClientUploadHandler } from '@payloadcms/storage-vercel-blob/client';
import AdminInlineListener from '@/components/admin/AdminInlineListener';

export const importMap: ImportMap = {
  '@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler':
    VercelBlobClientUploadHandler,
  '@/components/admin/AdminInlineListener': AdminInlineListener,
  '@/components/admin/AdminInlineListener#default': AdminInlineListener,
};
