import { Card } from "@/components/ui/card";

export function MTStatusPreview() {
  return (
    <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-turquoise-200 dark:border-cyan-500 p-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        System Status: Operational
      </div>
    </Card>
  );
}

export default MTStatusPreview;
