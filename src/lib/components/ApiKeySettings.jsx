import React, { useState } from 'react';

function ApiKeySettings({ onApiKeyChange }) {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleApiKeyChange = (newApiKey) => {
    setApiKey(newApiKey);
    // Notify parent component immediately without saving to localStorage
    onApiKeyChange(newApiKey);
  };

  const clearApiKey = () => {
    setApiKey('');
    onApiKeyChange('');
  };

  const hasApiKey = apiKey.trim().length > 0;

  return (
    <div className="mb-2">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        <span className="mr-1">⚙️</span>
        AI Settings
        <span className="ml-1">{showSettings ? '▲' : '▼'}</span>
        {hasApiKey && (
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
            ✓ API Key Set
          </span>
        )}
      </button>

      {showSettings && (
        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={isVisible ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-..."
                  className="w-full text-sm px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {isVisible ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {hasApiKey && (
                <button
                  onClick={clearApiKey}
                  className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Your API key is only used for this session and not stored</p>
            <p>• Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a></p>
            <p>• {hasApiKey ? 'AI auto-coding will use OpenAI GPT-3.5-turbo' : 'Without an API key, rule-based matching will be used'}</p>
            <p className="text-amber-600">⚠️ You'll need to re-enter your API key each time you refresh the page</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiKeySettings;
