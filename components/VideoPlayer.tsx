import React, { useEffect, useRef } from 'react';
import { TwitchInfo } from '../App';
import { Theme, PlayerMode } from '../types';

declare global {
  interface Window {
    Twitch: {
      Embed: new (divId: string | HTMLDivElement, options: any) => any;
    };
  }
}

interface VideoPlayerProps {
  twitchContent: TwitchInfo | null;
  theme: Theme;
  hostname: string;
  playerMode: PlayerMode;
}

const TWITCH_EMBED_SCRIPT_URL = 'https://embed.twitch.tv/embed/v1.js';

const loadTwitchEmbedScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Twitch && window.Twitch.Embed) {
      resolve();
      return;
    }
    const existingScript = document.querySelector(`script[src="${TWITCH_EMBED_SCRIPT_URL}"]`);
    if (existingScript) {
      const loadHandler = () => {
        resolve();
        existingScript.removeEventListener('load', loadHandler);
      };
      existingScript.addEventListener('load', loadHandler);
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.src = TWITCH_EMBED_SCRIPT_URL;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', (e) => reject(e));
    document.body.appendChild(script);
  });
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ twitchContent, theme, hostname, playerMode }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Logic for the full "Embed" player
    const isFullMode = playerMode === 'full' && twitchContent && twitchContent.type !== 'clip';
    
    if (!hostname || !isFullMode) {
      if (playerInstanceRef.current && playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';
        playerInstanceRef.current = null;
      }
      return;
    }
    
    let isMounted = true;

    const initializePlayer = () => {
      if (!isMounted || !playerContainerRef.current || !twitchContent) return;
      
      playerContainerRef.current.innerHTML = '';

      const commonOptions = {
        width: '100%',
        height: '100%',
        parent: [hostname],
        autoplay: true,
        muted: false,
        theme: theme,
      };

      let playerOptions;
      if (twitchContent.type === 'channel') {
        playerOptions = { ...commonOptions, channel: twitchContent.id, layout: 'video-with-chat' };
      } else if (twitchContent.type === 'video') {
         playerOptions = { ...commonOptions, video: twitchContent.id, layout: 'video' };
      }

      if (playerOptions) {
        playerInstanceRef.current = new window.Twitch.Embed(playerContainerRef.current, playerOptions);
      }
    };

    loadTwitchEmbedScript()
      .then(initializePlayer)
      .catch(error => console.error('Error loading or initializing Twitch embed:', error));
    
    return () => {
      isMounted = false;
    };

  }, [twitchContent, theme, hostname, playerMode]);

  if (!twitchContent) {
    return null;
  }

  if (!hostname) {
    return (
        <div className="w-full max-w-4xl">
            <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-3xl flex items-center justify-center border-4 border-gray-200/20 dark:border-gray-700/40">
                <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
                    Detecting environment...
                </p>
            </div>
      </div>
    );
  }

  const getMinimalPlayerSrc = () => {
    if (!twitchContent) return '';
    const baseParams = `parent=${hostname}&autoplay=true&muted=false`;
    switch(twitchContent.type) {
      case 'channel':
        return `https://player.twitch.tv/?channel=${twitchContent.id}&${baseParams}`;
      case 'video':
        // VODs require a 'v' prefix
        return `https://player.twitch.tv/?video=v${twitchContent.id}&${baseParams}`;
      case 'clip':
         return `https://clips.twitch.tv/embed?clip=${twitchContent.id}&parent=${hostname}&autoplay=true`;
      default:
        return '';
    }
  };

  const showFullPlayer = playerMode === 'full' && twitchContent.type !== 'clip';
  
  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border-4 border-gray-200/20 dark:border-gray-700/40">
        {showFullPlayer ? (
          <div ref={playerContainerRef} className="w-full h-full" />
        ) : (
          <iframe
            key={twitchContent.id + playerMode}
            src={getMinimalPlayerSrc()}
            title="Twitch Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
