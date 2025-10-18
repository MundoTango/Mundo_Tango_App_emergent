/**
 * About Page
 * Information about Mundo Tango platform
 */

import { Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Heart className="h-16 w-16 text-turquoise-500 mx-auto mb-4" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
            About Mundo Tango
          </h1>
        </div>

        <div className="prose prose-lg mx-auto">
          <p className="text-xl text-gray-700 leading-relaxed">
            Mundo Tango is a global social platform connecting the worldwide tango community. 
            We bring together dancers, organizers, and enthusiasts from every corner of the globe.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            To create a vibrant, inclusive digital space where the tango community can connect, 
            share, and grow together. We believe in the power of dance to unite people across 
            cultures and continents.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">What We Offer</h2>
          <ul className="text-gray-700 space-y-2">
            <li>A global network of tango dancers and communities</li>
            <li>Event discovery and management tools</li>
            <li>Memory sharing and community building</li>
            <li>AI-powered recommendations and assistance (276 specialized agents)</li>
            <li>Real-time connections and messaging</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Join Us</h2>
          <p className="text-gray-700 leading-relaxed">
            Whether you're a beginner taking your first steps or a seasoned dancer, Mundo Tango 
            welcomes you. Together, we're building the future of tango.
          </p>
        </div>
      </div>
    </div>
  );
}
