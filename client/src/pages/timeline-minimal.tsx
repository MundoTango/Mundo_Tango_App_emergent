import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TimelineMinimal() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-12">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-xl border border-turquoise-100 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent dark:from-turquoise-400 dark:to-cyan-400 mb-4" data-testid="text-page-title">Timeline Minimal Test</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-3">✅ If you can see this card, routing works!</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Current URL: {window.location.pathname}</p>
        </div>
      </div>
    </div>
  );
}