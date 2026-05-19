'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Click-to-upload image overlay.
 *
 * Renders nothing extra outside of preview mode. Inside the admin's
 * Live Preview iframe, hovering shows a "Click to replace image" overlay.
 * Clicking opens a hidden file picker. Selected file is uploaded to /api/media
 * and then attached to the parent global's image field.
 */
export const EditableImage = ({
  globalSlug,
  fieldPath,
  children,
  className,
  style,
}: {
  globalSlug: string;
  fieldPath: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsPreview(typeof window !== 'undefined' && window.self !== window.top);
  }, []);

  if (!isPreview) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('_payload', JSON.stringify({ alt: file.name }));
      const upRes = await fetch('/api/media', { method: 'POST', credentials: 'include', body: fd });
      if (!upRes.ok) {
        // eslint-disable-next-line no-console
        console.error('[inline-img] upload failed', upRes.status, await upRes.text());
        return;
      }
      const { doc } = (await upRes.json()) as { doc: { id: number } };

      const parts = fieldPath.split('.');
      const body: Record<string, unknown> = {};
      let cursor = body;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i] as string;
        cursor[key] = {};
        cursor = cursor[key] as Record<string, unknown>;
      }
      cursor[parts[parts.length - 1] as string] = doc.id;
      const patchRes = await fetch(`/api/globals/${globalSlug}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!patchRes.ok) {
        // eslint-disable-next-line no-console
        console.error('[inline-img] attach failed', patchRes.status, await patchRes.text());
        return;
      }
      window.location.reload();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`${className ?? ''} relative group cursor-pointer`}
      style={style}
      onClick={() => fileRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click();
      }}
      data-lwc-field={fieldPath}
      data-lwc-global={globalSlug}
    >
      {children}
      <div className="absolute inset-0 bg-cyan/0 hover:bg-cyan/30 transition-colors flex items-center justify-center text-white opacity-0 hover:opacity-100 pointer-events-none">
        <div className="bg-cyan text-white text-xs font-bold tracking-widest uppercase px-3 py-2 rounded shadow-lg">
          {uploading ? 'Uploading…' : 'Click to replace image'}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
};
