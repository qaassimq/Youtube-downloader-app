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
