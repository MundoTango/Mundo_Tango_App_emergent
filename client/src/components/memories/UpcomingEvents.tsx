/**
 * Upcoming Events Component - Code Split for Performance
 * Lazy loaded to reduce initial bundle size
 */

export const UpcomingEvents = () => (
  <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-cyan-200/20 p-6">
    <h3 className="text-lg font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent mb-4">
      Upcoming Events
    </h3>
    <div className="text-gray-600 text-sm space-y-3" role="status" aria-live="polite">
      <p>No upcoming events found</p>
      <p>Check your city or join our community</p>
    </div>
  </div>
);
