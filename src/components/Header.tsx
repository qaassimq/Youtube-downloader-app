import React from 'react';
import { Download, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-950/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
              <Download className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                YT Channel Downloader
                <Zap className="w-4 h-4 text-yellow-400" />
              </h1>
              <p className="text-xs text-gray-400">Multi-threaded • Organized • Professional</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
              yt-dlp powered
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              Multi-thread
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
