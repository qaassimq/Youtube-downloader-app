import React from 'react';
import { FolderTree, Folder, FolderOpen, FileVideo, FileText, Image } from 'lucide-react';
import { DownloadConfig } from '../types';

interface FolderStructureProps {
  config: DownloadConfig;
  channelId: string;
}

export function FolderStructure({ config, channelId }: FolderStructureProps) {
  const getStructurePreview = () => {
    const channelName = channelId || 'ChannelName';
    
    switch (config.folderStructure) {
      case 'channel/playlist/date':
        return [
          { name: channelName, type: 'folder', level: 0, open: true },
          { name: 'Uploads', type: 'folder', level: 1, open: true },
          { name: '2024-01', type: 'folder', level: 2, open: true },
          { name: '2024-01-15 - Video Title.mp4', type: 'video', level: 3 },
          { name: '2024-01-15 - Video Title.srt', type: 'sub', level: 3, show: config.downloadSubtitles },
          { name: '2024-01-15 - Video Title.jpg', type: 'thumb', level: 3, show: config.downloadThumbnails },
          { name: '2024-01-15 - Video Title.info.json', type: 'meta', level: 3, show: config.downloadMetadata },
          { name: '2024-01-22 - Another Video.mp4', type: 'video', level: 3 },
          { name: '2024-02', type: 'folder', level: 2, open: false },
          { name: 'Shorts', type: 'folder', level: 1, open: false },
          { name: 'Streams', type: 'folder', level: 1, open: false },
        ].filter(item => !('show' in item) || item.show);

      case 'channel/date':
        return [
          { name: channelName, type: 'folder', level: 0, open: true },
          { name: '2024', type: 'folder', level: 1, open: true },
          { name: '01', type: 'folder', level: 2, open: true },
          { name: '15 - Video Title.mp4', type: 'video', level: 3 },
          { name: '15 - Video Title.srt', type: 'sub', level: 3, show: config.downloadSubtitles },
          { name: '22 - Another Video.mp4', type: 'video', level: 3 },
          { name: '02', type: 'folder', level: 2, open: false },
        ].filter(item => !('show' in item) || item.show);

      case 'channel/playlist':
        return [
          { name: channelName, type: 'folder', level: 0, open: true },
          { name: 'Uploads', type: 'folder', level: 1, open: true },
          { name: '001 - First Video.mp4', type: 'video', level: 2 },
          { name: '001 - First Video.srt', type: 'sub', level: 2, show: config.downloadSubtitles },
          { name: '002 - Second Video.mp4', type: 'video', level: 2 },
          { name: 'Playlists', type: 'folder', level: 1, open: false },
        ].filter(item => !('show' in item) || item.show);

      case 'flat':
        return [
          { name: channelName, type: 'folder', level: 0, open: true },
          { name: 'Video Title 1.mp4', type: 'video', level: 1 },
          { name: 'Video Title 1.srt', type: 'sub', level: 1, show: config.downloadSubtitles },
          { name: 'Video Title 2.mp4', type: 'video', level: 1 },
          { name: 'Video Title 3.mp4', type: 'video', level: 1 },
          { name: '...', type: 'video', level: 1 },
        ].filter(item => !('show' in item) || item.show);

      default:
        return [];
    }
  };

  const getIcon = (item: any) => {
    switch (item.type) {
      case 'folder':
        return item.open ? <FolderOpen className="w-4 h-4 text-yellow-400" /> : <Folder className="w-4 h-4 text-yellow-500/60" />;
      case 'video':
        return <FileVideo className="w-4 h-4 text-blue-400" />;
      case 'sub':
        return <FileText className="w-4 h-4 text-green-400" />;
      case 'thumb':
        return <Image className="w-4 h-4 text-purple-400" />;
      case 'meta':
        return <FileText className="w-4 h-4 text-gray-400" />;
      default:
        return <FileVideo className="w-4 h-4 text-gray-400" />;
    }
  };

  const items = getStructurePreview();

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FolderTree className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Folder Structure</h2>
      </div>
      
      <div className="bg-gray-950/50 rounded-xl border border-gray-800/30 p-4 font-mono text-sm">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 py-1 hover:bg-gray-800/30 rounded px-2 -mx-2 transition-colors"
            style={{ paddingLeft: `${item.level * 20 + 8}px` }}
          >
            {getIcon(item)}
            <span className={`${
              item.type === 'folder' ? 'text-yellow-300 font-medium' :
              item.type === 'video' ? 'text-blue-300' :
              item.type === 'sub' ? 'text-green-300' :
              item.type === 'thumb' ? 'text-purple-300' :
              'text-gray-400'
            }`}>
              {item.name}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <FileVideo className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">Video file</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Subtitles</span>
          </div>
          <div className="flex items-center gap-2">
            <Image className="w-3 h-3 text-purple-400" />
            <span className="text-gray-400">Thumbnail</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Metadata</span>
          </div>
        </div>
      </div>

      {/* Thread visualization */}
      <div className="mt-4 pt-4 border-t border-gray-800/50">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Concurrent Threads ({config.concurrentDownloads})
        </h3>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < config.concurrentDownloads
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-sm shadow-red-500/20'
                  : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
