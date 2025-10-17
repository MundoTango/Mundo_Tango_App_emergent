/**
 * FILES TAB - Connected to CRUD API
 * MB.MD Track 2: Full file management with create/edit/delete
 */

import { useState, useEffect } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, Plus, Trash2, Edit, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface FileNode {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface SearchResult {
  file: string;
  line: number;
  content: string;
}

export default function FilesTabConnected() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['client/src']);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load files
  useEffect(() => {
    loadFiles('client/src');
  }, []);

  const loadFiles = async (directory: string) => {
    try {
      const response = await fetch(`/api/files/list?directory=${directory}`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      toast({
        title: "Failed to load files",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const toggleFolder = (path: string) => {
    setExpanded(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
    loadFiles(path);
  };

  const readFile = async (path: string) => {
    try {
      const response = await fetch(`/api/files/read?filePath=${path}`);
      const data = await response.json();
      setFileContent(data.content || '');
      setSelectedFile(path);
    } catch (error) {
      toast({
        title: "Failed to read file",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const createFile = async () => {
    try {
      const response = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: `client/src/${newFileName}`,
          content: newFileContent
        })
      });

      if (!response.ok) throw new Error('Failed to create file');

      toast({
        title: "File created",
        description: `Created ${newFileName}`,
        duration: 3000
      });

      setCreateDialogOpen(false);
      setNewFileName('');
      setNewFileContent('');
      loadFiles('client/src');
    } catch (error) {
      toast({
        title: "Failed to create file",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const updateFile = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch('/api/files/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: selectedFile,
          content: fileContent
        })
      });

      if (!response.ok) throw new Error('Failed to update file');

      toast({
        title: "File saved",
        description: `Saved ${selectedFile}`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Failed to save file",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const deleteFile = async (path: string) => {
    if (!confirm(`Delete ${path}?`)) return;

    try {
      const response = await fetch(`/api/files/delete?filePath=${path}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete file');

      toast({
        title: "File deleted",
        description: `Deleted ${path}`,
        duration: 3000
      });

      setSelectedFile(null);
      setFileContent('');
      loadFiles('client/src');
    } catch (error) {
      toast({
        title: "Failed to delete file",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const searchFiles = async () => {
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/files/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* File Tree */}
      <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Files</h3>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="create-file-button">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="pages/NewPage.tsx"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  data-testid="new-file-name"
                />
                <Textarea
                  placeholder="// File content..."
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  data-testid="new-file-content"
                />
                <Button onClick={createFile} className="w-full" data-testid="create-file-submit">
                  Create File
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              placeholder="Search in files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFiles()}
              data-testid="file-search-input"
            />
            <Button 
              onClick={searchFiles} 
              disabled={isSearching}
              size="sm"
              data-testid="file-search-button"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Results or File Tree */}
        <div className="flex-1 overflow-auto p-2">
          {searchResults.length > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {searchResults.length} results
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchResults([])}
                >
                  Clear
                </Button>
              </div>
              {searchResults.map((result, i) => (
                <div
                  key={i}
                  className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => readFile(result.file)}
                >
                  <div className="font-mono text-blue-600 dark:text-blue-400">{result.file}:{result.line}</div>
                  <div className="text-gray-600 dark:text-gray-400 truncate">{result.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {files.map(file => (
                <div key={file.path}>
                  {file.isDirectory ? (
                    <button
                      onClick={() => toggleFolder(file.path)}
                      className="flex items-center gap-1 w-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm"
                      data-testid={`folder-${file.name}`}
                    >
                      {expanded.includes(file.path) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <Folder className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                    </button>
                  ) : (
                    <div
                      className={`flex items-center gap-1 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm cursor-pointer ${
                        selectedFile === file.path ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => readFile(file.path)}
                      data-testid={`file-${file.name}`}
                    >
                      <FileCode className="w-4 h-4 text-gray-400 ml-5" />
                      <span className="text-gray-600 dark:text-gray-400 text-xs">{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Editor */}
      <div className="w-1/2 flex flex-col">
        {selectedFile ? (
          <>
            {/* Editor Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{selectedFile}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={updateFile}
                  data-testid="save-file-button"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFile(selectedFile)}
                  data-testid="delete-file-button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Editor */}
            <Textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="flex-1 resize-none font-mono text-sm border-0 focus-visible:ring-0"
              data-testid="file-editor-textarea"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Select a file to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
