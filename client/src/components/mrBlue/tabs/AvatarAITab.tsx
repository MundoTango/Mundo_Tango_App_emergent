import { Sparkles } from 'lucide-react';
import LumaAvatarGenerator from '@/components/mrBlue/LumaAvatarGenerator';

export default function AvatarAITab() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          3D Avatar Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create your personalized 3D avatar with AI (powered by Luma Labs)
        </p>
      </div>

      <LumaAvatarGenerator />
    </div>
  );
}
