import React, { useState, useEffect, useCallback } from 'react';
import { Theme } from './types';
import Header from './components/Header';
import InputBar from './components/InputBar';
import VideoPlayer from './components/VideoPlayer';
import ThemeToggle from './components/ThemeToggle';

export interface TwitchInfo {
  type: 'channel' | 'video' | 'clip';
  id: string;
}

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [twitchContent, setTwitchContent] = useState<TwitchInfo | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [hostname, setHostname] = useState<string>('');

  useEffect(() => {
    // Set the hostname once the component mounts.
    setHostname(window.location.hostname);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark:bg-gray-900');
      document.body.classList.remove('bg-gray-100');
    } else {
      root.classList.remove('dark');
      document.body.classList.add('bg-gray-100');
      document.body.classList.remove('dark:bg-gray-900');
    }
  }, [theme]);

  // On initial load, check URL for a twitch channel, video or clip
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const channel = urlParams.get('channel');
    const video = urlParams.get('video');
    const clip = urlParams.get('clip');
    if (channel) {
      setTwitchContent({ type: 'channel', id: channel });
    } else if (video) {
      setTwitchContent({ type: 'video', id: video });
    } else if (clip) {
      setTwitchContent({ type: 'clip', id: clip });
    }
  }, []);


  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);
  
  const extractTwitchInfo = (url: string): TwitchInfo | null => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

      // Clip URL: clips.twitch.tv/{slug}
      if (hostname.includes('clips.twitch.tv') && pathParts.length === 1) {
        return { type: 'clip', id: pathParts[0] };
      }
      
      if (hostname.includes('twitch.tv')) {
        // VOD URL: twitch.tv/videos/{video_id}
        if (pathParts[0] === 'videos' && pathParts[1]) {
          const videoId = pathParts[1];
          // Check if it's a numeric ID, possibly with a 'v' prefix from other contexts
          if (/^v?\d+$/.test(videoId)) {
            return { type: 'video', id: videoId.replace('v','') };
          }
        }

        // Clip URL: twitch.tv/{channel}/clip/{slug}
        if (pathParts.length === 3 && pathParts[1] === 'clip') {
          return { type: 'clip', id: pathParts[2] };
        }

        // Channel URL: twitch.tv/{channel_name}
        // Must be checked last as it's the most generic
        if (pathParts.length === 1 && pathParts[0] !== 'videos' && pathParts[0] !== 'clip') {
          const channelName = pathParts[0];
          return { type: 'channel', id: channelName };
        }
      }
    } catch (e) {
      return null; // Invalid URL
    }
    return null;
  };


  const handleUrlSubmit = (url: string) => {
    setUrlError(null);
    const extractedInfo = extractTwitchInfo(url);
    setTwitchContent(extractedInfo);
    
    const urlParams = new URLSearchParams();
    if (extractedInfo) {
      urlParams.set(extractedInfo.type, extractedInfo.id);
      window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    } else {
      if(url.trim()){
        setUrlError("Invalid Twitch URL. Please make sure it's a valid channel, VOD or clip link.");
      }
      window.history.pushState({}, '', window.location.pathname);
    }
  };
  
  const handleInputChange = () => {
    if(urlError) {
      setUrlError(null);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 font-sans">
      <div className="absolute top-6 right-6">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <main className="w-full max-w-4xl flex flex-col items-center space-y-6 sm:space-y-8">
        <Header />
        <div className="w-full max-w-2xl p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500">
          <InputBar onSubmit={handleUrlSubmit} onInputChange={handleInputChange} hasError={!!urlError} />
          {urlError && (
            <p className="mt-2 text-center text-red-600 dark:text-red-500 font-medium text-sm">
              {urlError}
            </p>
          )}
        </div>
        <VideoPlayer twitchContent={twitchContent} theme={theme} hostname={hostname} />
      </main>
    </div>
  );
};

export default App;