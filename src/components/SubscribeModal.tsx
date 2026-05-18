'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  siteUrl: string;
}

export const SubscribeModal = ({ siteUrl }: Props) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const httpsUrl = `${siteUrl.replace(/\/$/, '')}/events.ics`;
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, 'webcal://');
  const googleSubscribe = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(httpsUrl)}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(httpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline">
        Subscribe to Calendar
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="subscribe-title"
          className="fixed inset-0 z-50 bg-navy/60 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div ref={dialogRef} className="bg-white rounded-2xl shadow-card max-w-md w-full p-6">
            <h2 id="subscribe-title" className="text-xl font-extrabold text-navy">
              Subscribe to the Lions schedule
            </h2>
            <p className="text-sm text-muted mt-2">
              Add the Lions calendar to your phone or computer. Updates flow through automatically.
            </p>
            <div className="mt-5 space-y-2">
              <a
                href={googleSubscribe}
                target="_blank"
                rel="noopener noreferrer"
                className="block btn btn-cyan w-full"
              >
                Add to Google Calendar
              </a>
              <a href={webcalUrl} className="block btn btn-outline w-full">
                Add to Apple Calendar (iPhone / Mac)
              </a>
              <div className="text-xs text-muted pt-2">
                Outlook: Add calendar → Subscribe from web → paste the URL below.
              </div>
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  value={httpsUrl}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-off-white"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button type="button" onClick={copy} className="btn btn-cyan">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-muted">
                Google polls every ~12–24 hours; Apple typically refreshes within 15 minutes.
              </p>
            </div>
            <div className="mt-5 text-right">
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-navy">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
