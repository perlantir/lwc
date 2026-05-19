'use client';

import { useState } from 'react';

type Result = {
  ok?: boolean;
  createdCount?: number;
  failedCount?: number;
  failed?: Array<{ row: Record<string, unknown>; error: string }>;
  parseErrors?: string[];
  error?: string;
};

export const ImportEventsForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/events/bulk-upload', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const json = (await res.json().catch(() => ({}))) as Result;
      setResult(json);
    } catch (e) {
      setResult({ error: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-4">
      <label className="block text-sm font-semibold text-navy">
        CSV file
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block mt-2 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-cyan file:text-white file:font-semibold file:cursor-pointer hover:file:bg-cyan-dark cursor-pointer"
        />
      </label>
      {file && (
        <div className="text-[13px] text-muted">
          Selected: <strong className="text-navy">{file.name}</strong> ({Math.round(file.size / 1024)} KB)
        </div>
      )}
      <button
        type="submit"
        disabled={!file || submitting}
        className="btn btn-cyan disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Importing…' : 'Import events'}
      </button>

      {result && (
        <div
          className={`rounded-lg p-4 text-[14px] ${
            result.ok
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border border-amber-200 text-amber-900'
          }`}
        >
          {result.parseErrors && (
            <>
              <strong>Parse errors:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {result.parseErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          )}
          {result.ok && (
            <>
              <strong>Imported {result.createdCount} event{result.createdCount === 1 ? '' : 's'}.</strong>
              {result.failedCount ? (
                <>
                  {' '}({result.failedCount} failed){' '}
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {result.failed?.map((f, i) => (
                      <li key={i}>
                        <strong>{String(f.row.title)}</strong> — {f.error}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}
          {result.error && <span>{result.error}</span>}
        </div>
      )}
    </form>
  );
};
