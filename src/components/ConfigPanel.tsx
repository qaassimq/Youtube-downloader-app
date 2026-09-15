import { Settings, Cpu, Film, Subtitles, Image, FileText, Gauge, RotateCcw } from 'lucide-react';
import { DownloadConfig } from '../types';

interface ConfigPanelProps {
  config: DownloadConfig;
  setConfig: (config: DownloadConfig) => void;
}

export function ConfigPanel({ config, setConfig }: ConfigPanelProps) {
  const update = (key: keyof DownloadConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Download Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quality */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Film className="w-4 h-4 text-blue-400" />
            Video Quality
          </label>
          <select
            value={config.quality}
            onChange={(e) => update('quality', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
          >
            <option value="2160">4K (2160p)</option>
            <option value="1440">2K (1440p)</option>
            <option value="1080">1080p (Full HD)</option>
            <option value="720">720p (HD)</option>
            <option value="480">480p</option>
            <option value="best">Best Available</option>
          </select>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Film className="w-4 h-4 text-purple-400" />
            Output Format
          </label>
          <select
            value={config.format}
            onChange={(e) => update('format', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
          >
            <option value="mp4">MP4 (H.264)</option>
            <option value="mkv">MKV (Matroska)</option>
            <option value="webm">WebM (VP9)</option>
            <option value="mp3">MP3 (Audio Only)</option>
            <option value="m4a">M4A (Audio Only)</option>
          </select>
        </div>

        {/* Concurrent Downloads */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Cpu className="w-4 h-4 text-green-400" />
            Concurrent Downloads
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="10"
              value={config.concurrentDownloads}
              onChange={(e) => update('concurrentDownloads', parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <span className="w-8 text-center text-lg font-bold text-red-400">
              {config.concurrentDownloads}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {config.concurrentDownloads === 1 ? 'Single thread (safe)' : 
             config.concurrentDownloads <= 4 ? `${config.concurrentDownloads} threads (recommended)` :
             `${config.concurrentDownloads} threads (aggressive - may get rate limited)`}
          </p>
        </div>

        {/* Folder Structure */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Settings className="w-4 h-4 text-yellow-400" />
            Folder Structure
          </label>
          <select
            value={config.folderStructure}
            onChange={(e) => update('folderStructure', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
          >
            <option value="channel/playlist/date">Channel → Playlist → Date</option>
            <option value="channel/date">Channel → Date</option>
            <option value="channel/playlist">Channel → Playlist</option>
            <option value="flat">Flat (all in one folder)</option>
          </select>
        </div>

        {/* Rate Limit */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Gauge className="w-4 h-4 text-orange-400" />
            Rate Limit
          </label>
          <input
            type="text"
            value={config.rateLimit}
            onChange={(e) => update('rateLimit', e.target.value)}
            placeholder="e.g., 5M/s or leave empty"
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
          />
        </div>

        {/* Retries */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            Max Retries
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={config.retries}
            onChange={(e) => update('retries', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-6 pt-6 border-t border-gray-800/50">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Additional Options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <ToggleOption
            icon={<Subtitles className="w-4 h-4" />}
            label="Subtitles"
            checked={config.downloadSubtitles}
            onChange={(v) => update('downloadSubtitles', v)}
          />
          <ToggleOption
            icon={<Image className="w-4 h-4" />}
            label="Thumbnails"
            checked={config.downloadThumbnails}
            onChange={(v) => update('downloadThumbnails', v)}
          />
          <ToggleOption
            icon={<FileText className="w-4 h-4" />}
            label="Metadata"
            checked={config.downloadMetadata}
            onChange={(v) => update('downloadMetadata', v)}
          />
          <ToggleOption
            icon={<FileText className="w-4 h-4" />}
            label="Embed Meta"
            checked={config.embedMetadata}
            onChange={(v) => update('embedMetadata', v)}
          />
        </div>
        
        {config.downloadSubtitles && (
          <div className="mt-4">
            <label className="text-sm text-gray-400 mb-1 block">Subtitle Language Code</label>
            <input
              type="text"
              value={config.subtitleLang}
              onChange={(e) => update('subtitleLang', e.target.value)}
              placeholder="en, es, fr (comma separated or 'all')"
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleOption({ icon, label, checked, onChange }: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
        checked
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-gray-800/30 border-gray-700/30 text-gray-400 hover:border-gray-600/50'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      <div className={`ml-auto w-8 h-4 rounded-full transition-all relative ${
        checked ? 'bg-red-500/30' : 'bg-gray-700'
      }`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
          checked ? 'left-4 bg-red-400' : 'left-0.5 bg-gray-500'
        }`} />
      </div>
    </button>
  );
}
