import { useState } from 'react';
import { Header } from './components/Header';
import { ChannelInput } from './components/ChannelInput';
import { ConfigPanel } from './components/ConfigPanel';
import { FolderStructure } from './components/FolderStructure';
import { ScriptOutput } from './components/ScriptOutput';
import { QuickRun } from './components/QuickRun';
import { AISuggestions } from './components/AISuggestions';
import { QueueManager } from './components/QueueManager';
import { BulkInput } from './components/BulkInput';
import { DownloadConfig, QueueItem, AppMode, AIChannelSuggestion } from './types';
import { Download, ListOrdered, Sparkles } from 'lucide-react';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('queue');
  const [channelUrl, setChannelUrl] = useState('');
  const [config, setConfig] = useState<DownloadConfig>({
    quality: '1080',
    format: 'mp4',
    concurrentDownloads: 4,
    folderStructure: 'channel/playlist/date',
    subtitleLang: '',
    downloadSubtitles: false,
    downloadThumbnails: false,
    downloadMetadata: true,
    embedMetadata: true,
    rateLimit: '',
    retries: 10,
    retrySleep: 5,
  });
  const [scriptType, setScriptType] = useState<'bash' | 'powershell'>('bash');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueScriptOverride, setQueueScriptOverride] = useState<string | null>(null);

  const extractChannelId = (url: string): string => {
    const patterns = [
      /youtube\.com\/channel\/(UC[\w-]+)/,
      /youtube\.com\/@([\w.-]+)/,
      /youtube\.com\/c\/([\w.-]+)/,
      /youtube\.com\/user\/([\w.-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  // Queue Management Functions
  const addToQueue = (url: string, name: string, source: 'manual' | 'ai' = 'manual', topic?: string) => {
    if (queue.some(q => q.url === url)) return;
    const newItem: QueueItem = {
      id: generateId(),
      url,
      channelName: name,
      status: 'pending',
      addedAt: Date.now(),
      source,
      topic,
    };
    setQueue(prev => [...prev, newItem]);
  };

  const addMultipleToQueue = (items: { url: string; name: string }[], source: 'manual' | 'ai' = 'manual') => {
    const newItems: QueueItem[] = items
      .filter(item => !queue.some(q => q.url === item.url))
      .map(item => ({
        id: generateId(),
        url: item.url,
        channelName: item.name,
        status: 'pending' as const,
        addedAt: Date.now(),
        source,
      }));
    setQueue(prev => [...prev, ...newItems]);
  };

  const handleAIAddSingle = (url: string, name: string, topic: string) => {
    addToQueue(url, name, 'ai', topic);
  };

  const handleAIAddAll = (suggestions: AIChannelSuggestion[], topic: string) => {
    const items = suggestions.map(s => ({
      url: s.channelUrl,
      name: s.channelName,
    }));
    addMultipleToQueue(items, 'ai');
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const moveUp = (id: string) => {
    setQueue(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx <= 0) return prev;
      const newQueue = [...prev];
      [newQueue[idx - 1], newQueue[idx]] = [newQueue[idx], newQueue[idx - 1]];
      return newQueue;
    });
  };

  const moveDown = (id: string) => {
    setQueue(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const newQueue = [...prev];
      [newQueue[idx], newQueue[idx + 1]] = [newQueue[idx + 1], newQueue[idx]];
      return newQueue;
    });
  };

  const clearCompleted = () => {
    setQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  const clearAll = () => {
    setQueue([]);
    setQueueScriptOverride(null);
  };

  const handleStartQueue = () => {
    // Generate a combined script for all channels
    const pendingChannels = queue.filter(q => q.status === 'pending');
    if (pendingChannels.length === 0) return;

    // Mark as queued
    setQueue(prev => prev.map(item => 
      item.status === 'pending' ? { ...item, status: 'queued' as const } : item
    ));

    // Generate combined script
    const script = generateQueueScript(pendingChannels, config, scriptType);
    setQueueScriptOverride(script);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 mb-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-1.5">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                mode === 'single'
                  ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/10'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Single Channel</span>
            </button>
            <button
              onClick={() => setMode('queue')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all relative ${
                mode === 'queue'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Queue Mode</span>
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {queue.length}
                </span>
              )}
            </button>
          </div>

          {/* Single Channel Mode */}
          {mode === 'single' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <ChannelInput
                    channelUrl={channelUrl}
                    setChannelUrl={setChannelUrl}
                  />
                  
                  <ConfigPanel
                    config={config}
                    setConfig={setConfig}
                  />
                </div>

                <div className="space-y-6">
                  <FolderStructure
                    config={config}
                    channelId={extractChannelId(channelUrl)}
                  />
                </div>
              </div>

              <div className="mt-8">
                <QuickRun
                  channelUrl={channelUrl}
                  config={config}
                  channelId={extractChannelId(channelUrl)}
                />
              </div>

              <div className="mt-8">
                <ScriptOutput
                  channelUrl={channelUrl}
                  config={config}
                  scriptType={scriptType}
                  setScriptType={setScriptType}
                  channelId={extractChannelId(channelUrl)}
                />
              </div>
            </>
          )}

          {/* Queue Mode */}
          {mode === 'queue' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - AI Suggestions & Bulk Input */}
              <div className="lg:col-span-2 space-y-6">
                <AISuggestions
                  onAddToQueue={handleAIAddSingle}
                  onAddAllToQueue={handleAIAddAll}
                  existingUrls={queue.map(q => q.url)}
                />

                <BulkInput
                  onAddUrls={(urls) => addMultipleToQueue(urls, 'manual')}
                  existingUrls={queue.map(q => q.url)}
                />

                <ConfigPanel
                  config={config}
                  setConfig={setConfig}
                />
              </div>

              {/* Right Column - Queue */}
              <div className="space-y-6">
                <QueueManager
                  queue={queue}
                  onRemove={removeFromQueue}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                  onClearCompleted={clearCompleted}
                  onClearAll={clearAll}
                  onStartQueue={handleStartQueue}
                />

                <FolderStructure
                  config={config}
                  channelId={queue[0]?.channelName || 'MultiChannel'}
                />
              </div>
            </div>
          )}

          {/* Queue Script Output */}
          {mode === 'queue' && queueScriptOverride && (
            <div className="mt-8">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Queue Download Script ({queue.filter(q => q.status === 'queued' || q.status === 'pending').length} channels)
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(queueScriptOverride);
                      }}
                      className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        const ext = scriptType === 'bash' ? 'sh' : 'ps1';
                        const blob = new Blob([queueScriptOverride], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `download_queue.${ext}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 hover:bg-blue-500/30 transition-all"
                    >
                      Download Script
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-950/80 border border-gray-800/30 rounded-xl p-4 overflow-x-auto text-sm max-h-[500px] overflow-y-auto">
                  <code className="text-gray-300 font-mono whitespace-pre">
                    {queueScriptOverride}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Generate combined script for queue
function generateQueueScript(
  channels: QueueItem[],
  config: DownloadConfig,
  scriptType: 'bash' | 'powershell'
): string {
  if (scriptType === 'bash') {
    return generateBashQueueScript(channels, config);
  }
  return generatePowerShellQueueScript(channels, config);
}

function generateBashQueueScript(channels: QueueItem[], config: DownloadConfig): string {
  const qualityMap: Record<string, string> = {
    '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]',
    '1440': 'bestvideo[height<=1440]+bestaudio/best[height<=1440]',
    '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
    '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
    '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
    'best': 'bestvideo+bestaudio/best',
  };
  const formatSelector = qualityMap[config.quality] || qualityMap['1080'];

  const getOutputTemplate = (channelName: string) => {
    const safeName = channelName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const base = `./downloads/${safeName}`;
    switch (config.folderStructure) {
      case 'channel/playlist/date':
        return `${base}/%(playlist_title)s/%(upload_date>%Y-%m)s/%(upload_date>%Y-%m-%d)s - %(title)s.%(ext)s`;
      case 'channel/date':
        return `${base}/%(upload_date>%Y)s/%(upload_date>%m)s/%(upload_date>%Y-%m-%d)s - %(title)s.%(ext)s`;
      case 'channel/playlist':
        return `${base}/%(playlist_title)s/%(playlist_index)03d - %(title)s.%(ext)s`;
      case 'flat':
        return `${base}/%(title)s.%(ext)s`;
      default:
        return `${base}/%(title)s.%(ext)s`;
    }
  };

  const buildCommonArgs = () => {
    let args = `--format "${formatSelector}" --concurrent-fragments ${config.concurrentDownloads} --retries ${config.retries} --retry-sleep ${config.retrySleep}`;
    if (config.rateLimit) args += ` --limit-rate "${config.rateLimit}"`;
    if (config.format === 'mp3' || config.format === 'm4a') {
      args += ` --extract-audio --audio-format ${config.format} --audio-quality 0`;
    } else {
      args += ` --merge-output-format ${config.format}`;
    }
    if (config.embedMetadata) args += ' --embed-metadata --embed-thumbnail --embed-chapters';
    if (config.downloadSubtitles) {
      const lang = config.subtitleLang || 'en';
      args += ` --write-sub --write-auto-sub --sub-lang "${lang}" --sub-format srt --convert-subs srt`;
    }
    if (config.downloadThumbnails) args += ' --write-thumbnail --convert-thumbnails jpg';
    if (config.downloadMetadata) args += ' --write-info-json --write-description';
    args += ' --no-overwrites --continue --ignore-errors --no-abort-on-error --progress --restrict-filenames --windows-filenames';
    return args;
  };

  const lines = [
    '#!/bin/bash',
    '#============================================================',
    '# YouTube Multi-Channel Queue Downloader',
    `# Channels: ${channels.length}`,
    `# Generated: $(date +%Y-%m-%d)`,
    '#============================================================',
    '',
    '# Check yt-dlp',
    'if ! command -v yt-dlp &> /dev/null; then',
    '    echo "❌ yt-dlp not found. Installing..."',
    '    pip install -U yt-dlp',
    'fi',
    '',
    `TOTAL=${channels.length}`,
    'CURRENT=0',
    '',
  ];

  channels.forEach((channel, idx) => {
    const name = channel.channelName || `channel_${idx + 1}`;
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    lines.push(`# Channel ${idx + 1}: ${name}`);
    lines.push(`CURRENT=$((CURRENT + 1))`);
    lines.push(`echo ""`);
    lines.push(`echo "============================================================"`);
    lines.push(`echo "📺 [$CURRENT/$TOTAL] Downloading: ${name}"`);
    lines.push(`echo "============================================================"`);
    lines.push(`mkdir -p "./downloads/${safeName}"`);
    lines.push(`yt-dlp ${buildCommonArgs()} --output "${getOutputTemplate(name)}" "${channel.url}"`);
    lines.push('');
    lines.push(`if [ $? -eq 0 ]; then`);
    lines.push(`    echo "✅ [$CURRENT/$TOTAL] ${name} completed successfully"`);
    lines.push(`else`);
    lines.push(`    echo "⚠️  [$CURRENT/$TOTAL] ${name} had errors (continuing...)"`);
    lines.push(`fi`);
    lines.push('');
  });

  lines.push('echo ""');
  lines.push('echo "============================================================"');
  lines.push('echo "✅ All $TOTAL channels processed!"');
  lines.push('echo "============================================================"');

  return lines.join('\n');
}

function generatePowerShellQueueScript(channels: QueueItem[], config: DownloadConfig): string {
  const qualityMap: Record<string, string> = {
    '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]',
    '1440': 'bestvideo[height<=1440]+bestaudio/best[height<=1440]',
    '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
    '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
    '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
    'best': 'bestvideo+bestaudio/best',
  };
  const formatSelector = qualityMap[config.quality] || qualityMap['1080'];

  const getOutputTemplate = (channelName: string) => {
    const safeName = channelName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const base = `.\\downloads\\${safeName}`;
    switch (config.folderStructure) {
      case 'channel/playlist/date':
        return `${base}\\%(playlist_title)s\\%(upload_date>%Y-%m)s\\%(upload_date>%Y-%m-%d)s - %(title)s.%(ext)s`;
      case 'channel/date':
        return `${base}\\%(upload_date>%Y)s\\%(upload_date>%m)s\\%(upload_date>%Y-%m-%d)s - %(title)s.%(ext)s`;
      case 'channel/playlist':
        return `${base}\\%(playlist_title)s\\%(playlist_index)03d - %(title)s.%(ext)s`;
      case 'flat':
        return `${base}\\%(title)s.%(ext)s`;
      default:
        return `${base}\\%(title)s.%(ext)s`;
    }
  };

  const lines = [
    '#============================================================',
    '# YouTube Multi-Channel Queue Downloader',
    `# Channels: ${channels.length}`,
    `# Generated: ${new Date().toISOString().split('T')[0]}`,
    '#============================================================',
    '',
    '$ytDlpPath = Get-Command yt-dlp -ErrorAction SilentlyContinue',
    'if (-not $ytDlpPath) {',
    '    Write-Host "❌ yt-dlp not found. Installing..." -ForegroundColor Yellow',
    '    pip install -U yt-dlp',
    '}',
    '',
    `$Total = ${channels.length}`,
    '$Current = 0',
    '',
  ];

  channels.forEach((channel, idx) => {
    const name = channel.channelName || `channel_${idx + 1}`;
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    lines.push(`# Channel ${idx + 1}: ${name}`);
    lines.push(`$Current++`);
    lines.push(`Write-Host ""`);
    lines.push(`Write-Host "============================================================" -ForegroundColor DarkGray`);
    lines.push(`Write-Host "📺 [$Current/$Total] Downloading: ${name}" -ForegroundColor Cyan`);
    lines.push(`Write-Host "============================================================" -ForegroundColor DarkGray`);
    lines.push(`New-Item -ItemType Directory -Force -Path ".\\downloads\\${safeName}" | Out-Null`);
    lines.push(``);
    lines.push(`$args = @(`);
    lines.push(`    "--format", "${formatSelector}",`);
    lines.push(`    "--output", "${getOutputTemplate(name)}",`);
    lines.push(`    "--concurrent-fragments", "${config.concurrentDownloads}",`);
    lines.push(`    "--retries", "${config.retries}",`);
    lines.push(`    "--retry-sleep", "${config.retrySleep}",`);
    if (config.rateLimit) lines.push(`    "--limit-rate", "${config.rateLimit}",`);
    if (config.format === 'mp3' || config.format === 'm4a') {
      lines.push(`    "--extract-audio",`);
      lines.push(`    "--audio-format", "${config.format}",`);
      lines.push(`    "--audio-quality", "0",`);
    } else {
      lines.push(`    "--merge-output-format", "${config.format}",`);
    }
    if (config.embedMetadata) {
      lines.push(`    "--embed-metadata",`);
      lines.push(`    "--embed-thumbnail",`);
      lines.push(`    "--embed-chapters",`);
    }
    if (config.downloadSubtitles) {
      const lang = config.subtitleLang || 'en';
      lines.push(`    "--write-sub",`);
      lines.push(`    "--write-auto-sub",`);
      lines.push(`    "--sub-lang", "${lang}",`);
      lines.push(`    "--sub-format", "srt",`);
      lines.push(`    "--convert-subs", "srt",`);
    }
    if (config.downloadThumbnails) {
      lines.push(`    "--write-thumbnail",`);
      lines.push(`    "--convert-thumbnails", "jpg",`);
    }
    if (config.downloadMetadata) {
      lines.push(`    "--write-info-json",`);
      lines.push(`    "--write-description",`);
    }
    lines.push(`    "--no-overwrites",`);
    lines.push(`    "--continue",`);
    lines.push(`    "--ignore-errors",`);
    lines.push(`    "--no-abort-on-error",`);
    lines.push(`    "--progress",`);
    lines.push(`    "--restrict-filenames",`);
    lines.push(`    "--windows-filenames"`);
    lines.push(`)`);
    lines.push(``);
    lines.push(`try {`);
    lines.push(`    & yt-dlp @args "${channel.url}"`);
    lines.push(`    Write-Host "✅ [$Current/$Total] ${name} completed" -ForegroundColor Green`);
    lines.push(`} catch {`);
    lines.push(`    Write-Host "⚠️  [$Current/$Total] ${name} had errors" -ForegroundColor Yellow`);
    lines.push(`}`);
    lines.push(``);
  });

  lines.push(`Write-Host ""`);
  lines.push(`Write-Host "============================================================" -ForegroundColor Green`);
  lines.push(`Write-Host "✅ All $Total channels processed!" -ForegroundColor Green`);
  lines.push(`Write-Host "============================================================" -ForegroundColor Green`);

  return lines.join('\n');
}
