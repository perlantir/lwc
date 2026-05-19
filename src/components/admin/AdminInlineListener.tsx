'use client';

import { useEffect } from 'react';

/**
 * Mounted inside the Payload admin shell as a provider component.
 *
 * Listens for `lwc-inline-saved` messages posted from the live-preview iframe
 * when a user makes an inline edit + save. On receipt, reloads the admin page
 * so the form on the left re-fetches the freshly saved values.
 */
const AdminInlineListener = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string } | null;
      if (data?.type === 'lwc-inline-saved') {
        // Wait a tick so the iframe sees the response too, then refresh both panes.
        setTimeout(() => window.location.reload(), 100);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return <>{children}</>;
};

export default AdminInlineListener;
