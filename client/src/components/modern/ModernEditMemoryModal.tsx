import React, { useState, useEffect } from 'react';
import { X, Save, Image, Hash, Globe, Lock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: any;
  onSave: (id: number, data: any) => void;
}

export default function ModernEditMemoryModal({ isOpen, onClose, memory, onSave }: EditMemoryModalProps) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [hashtags, setHashtags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (memory) {
      setContent(memory.content || '');
      setPrivacy(memory.isPublic ? 'public' : 'private');
      setHashtags(memory.hashtags?.join(' ') || '');
    }
  }, [memory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !memory) return;
    
    setIsSaving(true);
    try {
      const hashtagsArray = hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.toLowerCase());
      
      await onSave(memory.id, {
        content: content.trim(),
        isPublic: privacy === 'public',
        hashtags: hashtagsArray.length > 0 ? hashtagsArray : null
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving memory:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const privacyOptions = [
    { value: 'public', icon: Globe, label: 'Public' },
    { value: 'private', icon: Lock, label: 'Private' },
    { value: 'friends', icon: Users, label: 'Friends Only' }
  ];

  if (!isOpen || !memory) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="modal-edit-memory"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900"
            onClick={onClose}
            data-testid="modal-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.1) 0%, rgba(21, 94, 117, 0.1) 100%)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Edit Memory</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 resize-none"
                  placeholder="Share your thoughts..."
                  required
                  data-testid="input-memory-content"
                />
              </div>

              {/* Hashtags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Hash className="inline w-4 h-4 mr-1" />
                  Hashtags
                </label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50"
                  placeholder="#memories #tango #buenosaires"
                  data-testid="input-hashtags"
                />
              </div>

              {/* Privacy */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Privacy
                </label>
                <div className="flex gap-3">
                  {privacyOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPrivacy(option.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                          privacy === option.value
                            ? 'bg-teal-400/20 text-teal-400 border border-teal-400/50'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                        data-testid={`button-privacy-${option.value}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Existing Media Preview */}
              {memory.imageUrl && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Image className="inline w-4 h-4 mr-1" />
                    Current Media
                  </label>
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={memory.imageUrl}
                      alt="Memory media"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  disabled={isSaving}
                  data-testid="button-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-500 hover:to-cyan-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  data-testid="button-save-memory"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}