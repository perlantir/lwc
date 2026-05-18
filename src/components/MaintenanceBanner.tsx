export const MaintenanceBanner = () => (
  <div className="min-h-screen flex items-center justify-center bg-navy text-white px-6">
    <div className="text-center max-w-md">
      <img
        src="/logos/lion-head-white-transparent.png"
        alt="Lions Wrestling"
        className="w-32 h-32 mx-auto opacity-90"
      />
      <h1 className="text-3xl font-extrabold mt-6">We'll be back shortly</h1>
      <p className="mt-3 text-white/80">
        The Lions Wrestling site is undergoing brief maintenance. Try again in a few minutes.
      </p>
    </div>
  </div>
);
