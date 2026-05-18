'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Drop-in client component that auto-refreshes the page when the parent admin
 * sends a Live Preview update. Mounted in the frontend layout — only active
 * when the page is being iframed by /admin (Live Preview pane).
 */
export const LivePreviewBridge = () => {
  const router = useRouter();

  useEffect(() => {
    // Detect iframe context (only matters when admin is the parent)
    if (typeof window === 'undefined') return;
    const isIframed = window.self !== window.top;
    if (!isIframed) return;

    const onMessage = (event: MessageEvent) => {
      // Payload posts messages like { type: 'payload-live-preview', ... }
      const data = event.data as { type?: string } | null;
      if (data?.type === 'payload-live-preview' || data?.type === 'livePreview') {
        router.refresh();
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router]);

  return null;
};
