/**
 * SECRETS TAB - Visual Environment Secrets Management
 * Matches Replit's Secrets functionality
 */

import { useState, useEffect } from 'react';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Secret {
  key: string;
  value: string;
  revealed: boolean;
}

export default function SecretsTab() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    try {
      const response = await fetch('/api/secrets');
      if (response.ok) {
        const data = await response.json();
        setSecrets(
          data.secrets?.map((key: string) => ({
            key,
            value: '•••••••••',
            revealed: false
          })) || []
        );
      }
    } catch (error) {
      console.error('Failed to fetch secrets:', error);
    }
  };

  const addSecret = async () => {
    if (!newKey || !newValue) {
      toast({ title: 'Error', description: 'Key and value are required', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, value: newValue })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Secret added successfully' });
        setNewKey('');
        setNewValue('');
        setIsAdding(false);
        fetchSecrets();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add secret', variant: 'destructive' });
    }
  };

  const deleteSecret = async (key: string) => {
    try {
      const response = await fetch(`/api/secrets/${key}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Success', description: 'Secret deleted' });
        fetchSecrets();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete secret', variant: 'destructive' });
    }
  };

  const toggleReveal = async (index: number) => {
    const secret = secrets[index];
    
    if (!secret.revealed) {
      // Fetch actual value
      try {
        const response = await fetch(`/api/secrets/${secret.key}`);
        if (response.ok) {
          const data = await response.json();
          const updated = [...secrets];
          updated[index] = { ...secret, value: data.value, revealed: true };
          setSecrets(updated);
        }
      } catch (error) {
        console.error('Failed to reveal secret:', error);
      }
    } else {
      const updated = [...secrets];
      updated[index] = { ...secret, value: '•••••••••', revealed: false };
      setSecrets(updated);
    }
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: 'Copied', description: 'Secret copied to clipboard' });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Secrets</h3>
          <span className="text-xs text-gray-400">({secrets.length} secrets)</span>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          data-testid="button-add-secret"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Secret
        </Button>
      </div>

      {/* Add New Secret Form */}
      {isAdding && (
        <div className="p-3 border-b border-gray-700 bg-gray-800 space-y-2">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="SECRET_KEY"
            className="bg-gray-700 border-gray-600 text-white"
            data-testid="input-secret-key"
          />
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Secret value"
            type="password"
            className="bg-gray-700 border-gray-600 text-white"
            data-testid="input-secret-value"
          />
          <div className="flex gap-2">
            <Button onClick={addSecret} size="sm" data-testid="button-save-secret">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button onClick={() => setIsAdding(false)} size="sm" variant="ghost" data-testid="button-cancel-secret">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Secrets List */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {secrets.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No secrets configured. Add your first secret to get started.
          </div>
        ) : (
          secrets.map((secret, index) => (
            <div
              key={secret.key}
              className="bg-gray-800 border border-gray-700 rounded p-3 flex items-center justify-between"
              data-testid={`secret-item-${secret.key}`}
            >
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{secret.key}</div>
                <div className="text-xs font-mono text-gray-400">{secret.value}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReveal(index)}
                  data-testid={`button-reveal-${secret.key}`}
                >
                  {secret.revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                {secret.revealed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(secret.value)}
                    data-testid={`button-copy-${secret.key}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSecret(secret.key)}
                  data-testid={`button-delete-${secret.key}`}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 bg-gray-800 text-xs text-gray-400">
        🔒 Secrets are encrypted and never exposed in logs
      </div>
    </div>
  );
}
