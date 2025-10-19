import { Card } from "@/components/ui/card";

export default function MTStatusPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-turquoise-200 dark:border-cyan-500 p-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Status
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                All Systems Operational
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
