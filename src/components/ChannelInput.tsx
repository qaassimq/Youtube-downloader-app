import { Link, Globe, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ChannelInputProps {
  channelUrl: string;
  setChannelUrl: (url: string) => void;
}

export function ChannelInput({ channelUrl, setChannelUrl }: ChannelInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateUrl = (url: string) => {
    if (!url) {
      setIsValid(null);
      return;
    }
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/channel\/UC[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/@[\w.-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/c\/[\w.-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/user\/[\w.-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+/,
    ];
    setIsValid(patterns.some(p => p.test(url)));
  };

  const handleChange = (value: string) => {
    setChannelUrl(value);
    validateUrl(value);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Channel URL</h2>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={channelUrl}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="https://youtube.com/@channelname or https://youtube.com/channel/UC..."
            className={`w-full pl-11 pr-10 py-3.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              isValid === false
                ? 'border-red-500/50 focus:ring-red-500/30'
                : isValid === true
                ? 'border-green-500/50 focus:ring-green-500/30'
                : 'border-gray-700/50 focus:ring-red-500/30'
            }`}
          />
          {isValid !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <span className="text-green-400 text-sm">✓</span>
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Supported formats:</span>
          <code className="text-xs text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded">youtube.com/@handle</code>
          <code className="text-xs text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded">youtube.com/channel/UC...</code>
          <code className="text-xs text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded">youtube.com/playlist?list=...</code>
        </div>
      </div>
    </div>
  );
}
