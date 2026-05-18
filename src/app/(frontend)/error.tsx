'use client';
import { useEffect } from 'react';

const ErrorBoundary = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    // Sentry will pick this up via global handler if DSN is set; locally we silently swallow.
    void error;
  }, [error]);
  return (
    <section className="px-6 md:px-14 py-24 text-center">
      <h1 className="text-3xl font-extrabold text-navy">Something broke on our end.</h1>
      <p className="mt-3 text-muted">Try refreshing. If it keeps happening, email lionswrestling@dmcschools.org.</p>
      <button onClick={reset} className="btn btn-cyan mt-6">Try again</button>
    </section>
  );
};

export default ErrorBoundary;
