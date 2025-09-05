import React, { useState, useEffect, useCallback } from 'react';
import { Theme, PlayerMode } from './types';
import Header from './components/Header';
import InputBar from './components/InputBar';
import VideoPlayer from './components/VideoPlayer';
import ThemeToggle from './components/ThemeToggle';
import PlayerModeToggle from './components/PlayerModeToggle';

export interface TwitchInfo {
  type: 'channel' | 'video' | 'clip';
  id: string;
}

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [playerMode, setPlayerMode] = useState<PlayerMode>('minimal');
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

  const togglePlayerMode = useCallback(() => {
    setPlayerMode((prevMode) => (prevMode === 'minimal' ? 'full' : 'minimal'));
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


  const handleUrlSubmit = (input: string) => {
    setUrlError(null);
    const trimmedInput = input.trim();

    if (!trimmedInput) {
        setTwitchContent(null);
        window.history.pushState({}, '', window.location.pathname);
        return;
    }

    let extractedInfo: TwitchInfo | null = null;
    
    // Heuristic: if it contains typical URL chars, treat as URL, otherwise treat as channel name
    const isUrlLike = trimmedInput.includes('.') || trimmedInput.includes('/');

    if (isUrlLike) {
        extractedInfo = extractTwitchInfo(trimmedInput.startsWith('http') ? trimmedInput : `https://${trimmedInput}`);
    } else {
        // Twitch channel names are 4-25 chars, alphanumeric + underscore
        if (/^[a-zA-Z0-9_]{4,25}$/.test(trimmedInput)) {
            extractedInfo = { type: 'channel', id: trimmedInput };
        }
    }

    setTwitchContent(extractedInfo);

    const urlParams = new URLSearchParams();
    if (extractedInfo) {
        urlParams.set(extractedInfo.type, extractedInfo.id);
        window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    } else {
        setUrlError("Invalid Twitch URL or channel name. Please try again.");
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
      <div className="absolute top-6 right-6 flex items-center space-x-2 z-10">
        <PlayerModeToggle playerMode={playerMode} togglePlayerMode={togglePlayerMode} disabled={twitchContent?.type === 'clip' || twitchContent?.type === 'video'}/>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <a
        href="http://minitube.dootinc.dpdns.org"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-5 left-5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 z-10"
      >
        Want to watch YouTube videos?
      </a>
      <main className={`w-full flex flex-col items-center space-y-6 sm:space-y-8 ${
          playerMode === 'full' && twitchContent?.type === 'channel' ? 'max-w-7xl' : 'max-w-4xl'
        } transition-all duration-500`}>
        <Header />
        <div className="w-full max-w-2xl p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500">
          <InputBar onSubmit={handleUrlSubmit} onInputChange={handleInputChange} hasError={!!urlError} />
          {urlError && (
            <p className="mt-2 text-center text-red-600 dark:text-red-500 font-medium text-sm">
              {urlError}
            </p>
          )}
        </div>
        <VideoPlayer 
          twitchContent={twitchContent} 
          theme={theme} 
          hostname={hostname} 
          playerMode={playerMode}
        />
      </main>
    </div>
  );
};

export default App;