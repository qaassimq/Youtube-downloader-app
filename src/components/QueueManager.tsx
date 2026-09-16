import React from 'react';
import { ListOrdered, Trash2, GripVertical, Play, CheckCircle2, Clock, AlertCircle, ArrowUp, ArrowDown, Sparkles, Link as LinkIcon } from 'lucide-react';
import { QueueItem } from '../types';

interface QueueManagerProps {
  queue: QueueItem[];
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onStartQueue: () => void;
}

export function QueueManager({
  queue,
  onRemove,
  onMoveUp,
  onMoveDown,
  onClearCompleted,
  onClearAll,
  onStartQueue,
}: QueueManagerProps) {
  const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'queued').length;
  const completedCount = queue.filter(q => q.status === 'completed').length;
  const errorCount = queue.filter(q => q.status === 'error').length;

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'queued':
        return <Play className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusLabel = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'queued': return 'Processing';
      case 'completed': return 'Done';
      case 'error': return 'Error';
    }
  };

  const extractChannelName = (url: string): string => {
    const patterns = [
      /youtube\.com\/@([\w.-]+)/,
      /youtube\.com\/channel\/(UC[\w-]+)/,
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
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <ListOrdered className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Download Queue</h2>
            <p className="text-xs text-gray-400">
              {queue.length} channels • {pendingCount} pending
              {completedCount > 0 && ` • ${completedCount} done`}
              {errorCount > 0 && ` • ${errorCount} errors`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 hover:text-white hover:border-gray-600 transition-all"
            >
              Clear Done
            </button>
          )}
          {queue.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 hover:bg-red-500/20 transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {queue.length === 0 && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-2xl mb-4">
            <ListOrdered className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Queue is empty</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Add channels manually, use AI suggestions, or paste multiple URLs to build your download queue
          </p>
        </div>
      )}

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {queue.map((item, idx) => (
            <div
              key={item.id}
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                item.status === 'completed'
                  ? 'bg-green-500/5 border-green-500/20'
                  : item.status === 'error'
                  ? 'bg-red-500/5 border-red-500/20'
                  : 'bg-gray-800/30 border-gray-700/30 hover:border-blue-500/30'
              }`}
            >
              {/* Position */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => onMoveUp(item.id)}
                  disabled={idx === 0}
                  className="p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <span className="text-xs font-mono text-gray-500 text-center w-5">
                  {idx + 1}
                </span>
                <button
                  onClick={() => onMoveDown(item.id)}
                  disabled={idx === queue.length - 1}
                  className="p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-medium text-white truncate">
                    {item.channelName || extractChannelName(item.url)}
                  </h4>
                  {item.source === 'ai' && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded flex-shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-mono truncate">
                  {item.url}
                </p>
                {item.topic && (
                  <p className="text-xs text-purple-400/70 mt-0.5">
                    Topic: {item.topic}
                  </p>
                )}
              </div>

              {/* Status Label */}
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                item.status === 'queued' ? 'bg-blue-500/10 text-blue-400' :
                item.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {getStatusLabel(item.status)}
              </span>

              {/* Remove */}
              <button
                onClick={() => onRemove(item.id)}
                className="flex-shrink-0 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Start Queue Button */}
      {pendingCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <button
            onClick={onStartQueue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            <Play className="w-4 h-4" />
            <span>Generate Script for {pendingCount} Channel{pendingCount !== 1 ? 's' : ''}</span>
          </button>
        </div>
      )}
    </div>
  );
}
