/**
 * J1 Journey: Join Page
 * Call-to-action page for new user registration
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, Calendar, Users, Heart, Globe } from "lucide-react";

export default function Join() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-cyan-600 dark:from-teal-900 dark:to-cyan-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white dark:text-teal-100 mb-4">
              Join Mundo Tango Today
            </h1>
            <p className="text-xl text-white/90 dark:text-teal-200">
              Connect with thousands of tango dancers worldwide
            </p>
          </div>

          <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 border-white/30 mb-8" data-testid="card-benefits">
            <CardHeader>
              <CardTitle className="text-white dark:text-teal-100 text-center text-2xl">
                What You Get
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3" data-testid="benefit-events">
                  <Calendar className="h-6 w-6 text-white dark:text-teal-300 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white dark:text-teal-100">Discover Events</h3>
                    <p className="text-white/80 dark:text-teal-200 text-sm">
                      Find milongas and festivals worldwide
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3" data-testid="benefit-community">
                  <Users className="h-6 w-6 text-white dark:text-teal-300 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white dark:text-teal-100">Connect with Dancers</h3>
                    <p className="text-white/80 dark:text-teal-200 text-sm">
                      Build your global tango network
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3" data-testid="benefit-memories">
                  <Heart className="h-6 w-6 text-white dark:text-teal-300 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white dark:text-teal-100">Share Memories</h3>
                    <p className="text-white/80 dark:text-teal-200 text-sm">
                      Post photos and moments from your dances
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3" data-testid="benefit-travel">
                  <Globe className="h-6 w-6 text-white dark:text-teal-300 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white dark:text-teal-100">Travel & Dance</h3>
                    <p className="text-white/80 dark:text-teal-200 text-sm">
                      Explore tango scenes in every city
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-x-4">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-cyan-600 hover:bg-white/90 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-600"
                data-testid="button-register"
              >
                Create Account
              </Button>
            </Link>
            <Link href="/">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10 dark:border-teal-300 dark:text-teal-300"
                data-testid="button-back"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
