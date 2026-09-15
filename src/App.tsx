import { useState } from 'react';
import { Header } from './components/Header';
import { ChannelInput } from './components/ChannelInput';
import { ConfigPanel } from './components/ConfigPanel';
import { FolderStructure } from './components/FolderStructure';
import { ScriptOutput } from './components/ScriptOutput';
import { DownloadConfig } from './types';

export default function App() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Input & Config */}
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

            {/* Right Column - Folder Structure Preview */}
            <div className="space-y-6">
              <FolderStructure
                config={config}
                channelId={extractChannelId(channelUrl)}
              />
            </div>
          </div>

          {/* Full Width - Script Output */}
          <div className="mt-8">
            <ScriptOutput
              channelUrl={channelUrl}
              config={config}
              scriptType={scriptType}
              setScriptType={setScriptType}
              channelId={extractChannelId(channelUrl)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
