/**
 * Platform Search Tab
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function PlatformSearchTab() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search Mundo Tango..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-center py-12 text-gray-500">
        {query ? `No results found for "${query}"` : 'Start typing to search...'}
      </div>
    </div>
  );
}
