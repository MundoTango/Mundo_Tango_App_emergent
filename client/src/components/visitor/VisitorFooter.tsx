import { Music, Github, Heart } from "lucide-react";
import { Link } from "wouter";

export default function VisitorFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20"
      data-testid="footer-visitor"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-turquoise-500 to-cyan-600 rounded-lg">
                <Music className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Mundo Tango
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connecting the global tango community, one dance at a time.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors"
                    data-testid="link-footer-home"
                  >
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/discover">
                  <a 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors"
                    data-testid="link-footer-discover"
                  >
                    Discover
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors"
                    data-testid="link-footer-about"
                  >
                    About
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/join">
                  <a 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors"
                    data-testid="link-footer-join"
                  >
                    Join
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/mundotango/platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors flex items-center gap-1"
                  data-testid="link-footer-github"
                >
                  <Github className="h-4 w-4" />
                  Open Source
                </a>
              </li>
              <li>
                <Link href="/volunteer">
                  <a 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors"
                    data-testid="link-footer-volunteer"
                  >
                    Become a Volunteer
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="https://gofundme.com/mundotango"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors flex items-center gap-1"
                  data-testid="link-footer-donate"
                >
                  <Heart className="h-4 w-4" />
                  Support Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy">
                  <a 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors"
                    data-testid="link-footer-privacy"
                  >
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors"
                    data-testid="link-footer-terms"
                  >
                    Terms of Service
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/code-of-conduct">
                  <a 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors"
                    data-testid="link-footer-code-of-conduct"
                  >
                    Code of Conduct
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Mundo Tango. Built with ❤️ by the global tango community.
          </p>
        </div>
      </div>
    </footer>
  );
}
