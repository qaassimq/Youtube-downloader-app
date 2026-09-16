import { useState } from 'react';
import React from 'react';
import { Link2, Plus, AlertCircle, FileText } from 'lucide-react';

interface BulkInputProps {
  onAddUrls: (urls: { url: string; name: string }[]) => void;
  existingUrls: string[];
}

export function BulkInput({ onAddUrls, existingUrls }: BulkInputProps) {
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseUrls = (text: string): { url: string; name: string }[] => {
    const lines = text.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
    const results: { url: string; name: string }[] = [];
    
    for (const line of lines) {
      // Try to extract URL from line
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        const url = urlMatch[0];
        // Try to extract channel name
        const patterns = [
          /youtube\.com\/@([\w.-]+)/,
          /youtube\.com\/channel\/(UC[\w-]+)/,
          /youtube\.com\/c\/([\w.-]+)/,
          /youtube\.com\/user\/([\w.-]+)/,
        ];
        let name = url;
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) {
            name = match[1];
            break;
          }
        }
        results.push({ url, name });
      }
    }
    
    return results;
  };

  const handleAdd = () => {
    const urls = parseUrls(input);
    if (urls.length === 0) {
      setError('No valid YouTube URLs found');
      return;
    }
    
    const newUrls = urls.filter(u => !existingUrls.includes(u.url));
    if (newUrls.length === 0) {
      setError('All URLs are already in the queue');
      return;
    }
    
    onAddUrls(newUrls);
    setInput('');
    setError(null);
    setShowInput(false);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Link2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Bulk Add Channels</h2>
            <p className="text-xs text-gray-400">Paste multiple URLs at once</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs text-cyan-300 hover:bg-cyan-500/20 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          {showInput ? 'Hide' : 'Show'}
        </button>
      </div>

      {showInput && (
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={`Paste YouTube channel URLs (one per line or comma-separated):\n\nhttps://youtube.com/@mkbhd\nhttps://youtube.com/@veritasium\nhttps://youtube.com/@3blue1brown`}
            rows={5}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono text-sm resize-none"
          />
          
          {error && (
            <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {parseUrls(input).length} URL{parseUrls(input).length !== 1 ? 's' : ''} detected
            </p>
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add to Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
