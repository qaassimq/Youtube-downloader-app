import { useState } from 'react';
import React from 'react';
import { Sparkles, Search, Loader2, Plus, Check, AlertCircle, Key, Eye, EyeOff, X } from 'lucide-react';
import { AIChannelSuggestion } from '../types';
import { suggestChannels, getApiKey, setApiKey, validateApiKey } from '../utils/deepseek';

interface AISuggestionsProps {
  onAddToQueue: (url: string, name: string, topic: string) => void;
  onAddAllToQueue: (suggestions: AIChannelSuggestion[], topic: string) => void;
  existingUrls: string[];
}

export function AISuggestions({ onAddToQueue, onAddAllToQueue, existingUrls }: AISuggestionsProps) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AIChannelSuggestion[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [showApiSettings, setShowApiSettings] = useState(!getApiKey());
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);

  const handleSuggest = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or interest');
      return;
    }

    const key = getApiKey();
    if (!key) {
      setError('Please set your DeepSeek API key first');
      setShowApiSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setAddedIds(new Set());

    try {
      const results = await suggestChannels(topic, count);
      setSuggestions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingle = (suggestion: AIChannelSuggestion) => {
    if (existingUrls.includes(suggestion.channelUrl)) return;
    onAddToQueue(suggestion.channelUrl, suggestion.channelName, topic);
    setAddedIds(new Set([...addedIds, suggestion.channelUrl]));
  };

  const handleAddAll = () => {
    const newSuggestions = suggestions.filter(
      s => !existingUrls.includes(s.channelUrl) && !addedIds.has(s.channelUrl)
    );
    if (newSuggestions.length === 0) return;
    onAddAllToQueue(newSuggestions, topic);
    const newIds = new Set([...addedIds, ...newSuggestions.map(s => s.channelUrl)]);
    setAddedIds(newIds);
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setError('Please enter an API key');
      return;
    }
    setValidatingKey(true);
    setKeyValid(null);
    const isValid = await validateApiKey(apiKeyInput.trim());
    setKeyValid(isValid);
    setValidatingKey(false);
    
    if (isValid) {
      setApiKey(apiKeyInput.trim());
      setError(null);
      setTimeout(() => setShowApiSettings(false), 1000);
    } else {
      setError('Invalid API key. Please check and try again.');
    }
  };

  const isAlreadyAdded = (url: string) => {
    return existingUrls.includes(url) || addedIds.has(url);
  };

  return (
    <div className="bg-gradient-to-br from-purple-950/30 to-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Channel Discovery</h2>
            <p className="text-xs text-gray-400">Powered by DeepSeek AI</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowApiSettings(!showApiSettings)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-gray-300 hover:text-white hover:border-gray-600 transition-all"
        >
          <Key className="w-3.5 h-3.5" />
          API Key {getApiKey() ? '✓' : ''}
        </button>
      </div>

      {/* API Key Settings */}
      {showApiSettings && (
        <div className="mb-4 p-4 bg-gray-900/50 border border-gray-800/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">DeepSeek API Configuration</h3>
            <button
              onClick={() => setShowApiSettings(false)}
              className="text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400">
              API Key (stored locally in your browser)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 pr-10 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                disabled={validatingKey}
                className="px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300 hover:bg-purple-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {validatingKey ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : keyValid === true ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a
                href="https://platform.deepseek.com/api_keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                platform.deepseek.com
              </a>
              {' '}or set <code className="bg-gray-800/50 px-1 rounded">VITE_DEEPSEEKAPI</code> env variable
            </p>
            {keyValid === false && (
              <p className="text-xs text-red-400">❌ Invalid API key</p>
            )}
            {keyValid === true && (
              <p className="text-xs text-green-400">✓ API key validated successfully</p>
            )}
          </div>
        </div>
      )}

      {/* Topic Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
              placeholder="e.g., machine learning tutorials, cooking channels, travel vlogs..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            />
          </div>
          <select
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="px-3 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>

        <button
          onClick={handleSuggest}
          disabled={loading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Get Channel Suggestions</span>
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">
              {suggestions.length} Channels Found
            </h3>
            <button
              onClick={handleAddAll}
              disabled={suggestions.every(s => isAlreadyAdded(s.channelUrl))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-xs text-green-300 hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add All to Queue
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {suggestions.map((suggestion, idx) => {
              const alreadyAdded = isAlreadyAdded(suggestion.channelUrl);
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    alreadyAdded
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-gray-800/30 border-gray-700/30 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {suggestion.channelName}
                        </h4>
                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded flex-shrink-0">
                          {suggestion.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1 line-clamp-1">
                        {suggestion.description}
                      </p>
                      <p className="text-xs text-gray-500 italic line-clamp-1">
                        💡 {suggestion.reason}
                      </p>
                      <p className="text-xs text-blue-400/70 mt-1 font-mono truncate">
                        {suggestion.channelUrl}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleAddSingle(suggestion)}
                      disabled={alreadyAdded}
                      className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                        alreadyAdded
                          ? 'bg-green-500/20 text-green-400 cursor-default'
                          : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                      }`}
                      title={alreadyAdded ? 'Already in queue' : 'Add to queue'}
                    >
                      {alreadyAdded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
