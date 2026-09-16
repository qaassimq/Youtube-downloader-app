export interface DownloadConfig {
  quality: string;
  format: string;
  concurrentDownloads: number;
  folderStructure: string;
  subtitleLang: string;
  downloadSubtitles: boolean;
  downloadThumbnails: boolean;
  downloadMetadata: boolean;
  embedMetadata: boolean;
  rateLimit: string;
  retries: number;
  retrySleep: number;
}

export type FolderStructureType = 
  | 'channel/playlist/date'
  | 'channel/date'
  | 'channel/playlist'
  | 'flat';

export interface QueueItem {
  id: string;
  url: string;
  channelName: string;
  status: 'pending' | 'queued' | 'completed' | 'error';
  addedAt: number;
  source: 'manual' | 'ai';
  topic?: string;
}

export interface AIChannelSuggestion {
  channelName: string;
  channelUrl: string;
  description: string;
  category: string;
  reason: string;
}

export type AppMode = 'single' | 'queue';
