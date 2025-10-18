/**
 * About Page - Information about Mundo Tango platform
 */

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent" data-testid="text-title">
          About Mundo Tango
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4" data-testid="text-mission">
            Mundo Tango connects the global tango community through technology, making it easier for dancers to discover events, share memories, and build meaningful connections.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Platform Stats</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div data-testid="stat-users">
              <p className="text-3xl font-bold text-teal-600">1,250+</p>
              <p className="text-gray-600 dark:text-gray-400">Active Dancers</p>
            </div>
            <div data-testid="stat-events">
              <p className="text-3xl font-bold text-teal-600">450</p>
              <p className="text-gray-600 dark:text-gray-400">Events Listed</p>
            </div>
            <div data-testid="stat-cities">
              <p className="text-3xl font-bold text-teal-600">145</p>
              <p className="text-gray-600 dark:text-gray-400">Cities</p>
            </div>
            <div data-testid="stat-countries">
              <p className="text-3xl font-bold text-teal-600">68</p>
              <p className="text-gray-600 dark:text-gray-400">Countries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
