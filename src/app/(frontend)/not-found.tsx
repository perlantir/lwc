import Link from 'next/link';

const NotFound = () => (
  <section className="px-6 md:px-14 py-24 text-center">
    <div className="eyebrow">404</div>
    <h1 className="text-3xl font-extrabold mt-2 text-navy">We couldn't find that page.</h1>
    <p className="mt-3 text-muted">Try the home page or the schedule.</p>
    <div className="mt-6 flex gap-3 justify-center">
      <Link href="/" className="btn btn-cyan">Home</Link>
      <Link href="/schedule" className="btn btn-outline">Schedule</Link>
    </div>
  </section>
);

export default NotFound;
