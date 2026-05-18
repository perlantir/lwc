import type { ImportMap } from 'payload';
import { VercelBlobClientUploadHandler } from '@payloadcms/storage-vercel-blob/client';

export const importMap: ImportMap = {
  '@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler':
    VercelBlobClientUploadHandler,
};
