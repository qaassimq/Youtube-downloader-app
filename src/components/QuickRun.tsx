import { useState } from 'react';
import { Terminal, Copy, Check, Play, Zap, AlertCircle } from 'lucide-react';
import { DownloadConfig } from '../types';

interface QuickRunProps {
  channelUrl: string;
  config: DownloadConfig;
  channelId: string;
}

function generateQuickCommand(channelUrl: string, config: DownloadConfig, channelId: string): string {
  const channelName = channelId || 'ChannelName';
  const outputDir = `./downloads/${channelName}`;
  
  let outputTemplate = '';
  switch (config.folderStructure) {
    case 'channel/playlist/date':
      outputTemplate = `${outputDir}/%(playlist_title)s/%(upload_date>%Y-%m)s/%(upload_date>%Y-%m-%d)s - %(title)s.%(ext)s`;
      break;
    case 'channel/date':
      outputTemplate = `${outputDir}/%(upload_date>%Y)s/%(upload_date>%m)s/%(upload_date>%Y-%m-%d)s - %(title)s.%(ext)s`;
      break;
    case 'channel/playlist':
      outputTemplate = `${outputDir}/%(playlist_title)s/%(playlist_index)03d - %(title)s.%(ext)s`;
      break;
    case 'flat':
      outputTemplate = `${outputDir}/%(title)s.%(ext)s`;
      break;
  }

  const qualityMap: Record<string, string> = {
    '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]',
    '1440': 'bestvideo[height<=1440]+bestaudio/best[height<=1440]',
    '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
    '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
    '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
    'best': 'bestvideo+bestaudio/best',
  };

  const formatSelector = qualityMap[config.quality] || qualityMap['1080'];
  
  let cmd = `yt-dlp --format "${formatSelector}" --output "${outputTemplate}" --concurrent-fragments ${config.concurrentDownloads} --retries ${config.retries} --retry-sleep ${config.retrySleep}`;

  if (config.rateLimit) {
    cmd += ` --limit-rate "${config.rateLimit}"`;
  }

  if (config.format === 'mp3' || config.format === 'm4a') {
    cmd += ` --extract-audio --audio-format ${config.format} --audio-quality 0`;
  } else {
    cmd += ` --merge-output-format ${config.format}`;
  }

  if (config.embedMetadata) {
    cmd += ' --embed-metadata --embed-thumbnail --embed-chapters';
  }

  if (config.downloadSubtitles) {
    const lang = config.subtitleLang || 'en';
    cmd += ` --write-sub --write-auto-sub --sub-lang "${lang}" --sub-format srt --convert-subs srt`;
  }

  if (config.downloadThumbnails) {
    cmd += ' --write-thumbnail --convert-thumbnails jpg';
  }

  if (config.downloadMetadata) {
    cmd += ' --write-info-json --write-description';
  }

  cmd += ' --no-overwrites --continue --ignore-errors --no-abort-on-error --progress --restrict-filenames --windows-filenames';
  cmd += ` "${channelUrl || 'YOUR_CHANNEL_URL'}"`;

  return cmd;
}

export function QuickRun({ channelUrl, config, channelId }: QuickRunProps) {
  const [copied, setCopied] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const command = generateQuickCommand(channelUrl, config, channelId);
  const isUrlValid = channelUrl && (
    channelUrl.includes('youtube.com/channel/') ||
    channelUrl.includes('youtube.com/@') ||
    channelUrl.includes('youtube.com/c/') ||
    channelUrl.includes('youtube.com/user/') ||
    channelUrl.includes('youtube.com/playlist?list=')
  );

  const handleCopyAndRun = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShowTerminal = () => {
    setShowTerminal(!showTerminal);
  };

  return (
    <div className="bg-gradient-to-br from-red-950/30 to-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Quick Run</h2>
            <p className="text-xs text-gray-400">Copy command and execute in terminal</p>
          </div>
        </div>
        
        <button
          onClick={handleShowTerminal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-all"
        >
          <Terminal className="w-4 h-4" />
          {showTerminal ? 'Hide' : 'Show'} Command
        </button>
      </div>

      {!isUrlValid && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <p className="font-medium">Please enter a valid YouTube channel URL first</p>
            <p className="text-xs text-yellow-300/70 mt-1">The command will be ready once you provide a valid channel link</p>
          </div>
        </div>
      )}

      {/* Main Action Button */}
      <button
        onClick={handleCopyAndRun}
        disabled={!isUrlValid}
        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium text-base transition-all ${
          isUrlValid
            ? copied
              ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400'
              : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40'
            : 'bg-gray-800/50 border-2 border-gray-700/50 text-gray-500 cursor-not-allowed'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            <span>Copied to Clipboard! Paste in Terminal</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            <span>Copy Command & Run</span>
            <Copy className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Terminal Preview */}
      {showTerminal && (
        <div className="mt-4 bg-gray-950/80 border border-gray-800/50 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border-b border-gray-800/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-gray-400 font-mono">Terminal</span>
          </div>
          
          <div className="p-4 font-mono text-sm overflow-x-auto">
            <div className="text-green-400 mb-2">$ {command}</div>
            <div className="text-gray-500 text-xs mt-3 space-y-1">
              <p>📋 Command copied to clipboard</p>
              <p>💡 Open your terminal and paste (Ctrl+V or Cmd+V)</p>
              <p>⚡ Press Enter to start downloading</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Instructions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">1</div>
            <span className="text-sm font-medium text-gray-300">Click Button</span>
          </div>
          <p className="text-xs text-gray-500">Copy command to clipboard</p>
        </div>
        
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">2</div>
            <span className="text-sm font-medium text-gray-300">Open Terminal</span>
          </div>
          <p className="text-xs text-gray-500">Cmd+T (Mac) or Ctrl+Alt+T (Linux)</p>
        </div>
        
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">3</div>
            <span className="text-sm font-medium text-gray-300">Paste & Run</span>
          </div>
          <p className="text-xs text-gray-500">Ctrl+V then press Enter</p>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-300">
          <span className="font-semibold">💡 Prerequisites:</span> Make sure yt-dlp is installed. 
          If not, run: <code className="bg-gray-900/50 px-1.5 py-0.5 rounded text-blue-400">pip install -U yt-dlp</code>
        </p>
      </div>
    </div>
  );
}
