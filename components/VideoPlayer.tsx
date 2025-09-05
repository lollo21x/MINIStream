import React, { useEffect, useRef } from 'react';
import { TwitchInfo } from '../App';
import { Theme } from '../types';

// Update global interface for the new Twitch.Embed library
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
}

// Use the new, more robust embed script URL
const TWITCH_EMBED_SCRIPT_URL = 'https://embed.twitch.tv/embed/v1.js';

// Helper to load the script once
const loadTwitchEmbedScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If script is already loaded, resolve immediately
    if (window.Twitch && window.Twitch.Embed) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${TWITCH_EMBED_SCRIPT_URL}"]`);
    if (existingScript) {
        // If script is loading, wait for it to finish
        existingScript.addEventListener('load', () => resolve());
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


const VideoPlayer: React.FC<VideoPlayerProps> = ({ twitchContent, theme, hostname }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Do not proceed if there is no hostname or content, or if content is a clip (handled by iframe)
    if (!hostname || !twitchContent || twitchContent.type === 'clip') {
      if (playerInstanceRef.current && playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';
        playerInstanceRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const initializePlayer = () => {
      if (!isMounted || !playerContainerRef.current) return;
      
      playerContainerRef.current.innerHTML = '';

      const commonOptions = {
        width: '100%',
        height: '100%',
        parent: [hostname],
        autoplay: true,
        muted: false,
        layout: 'video', // Use 'video' layout to hide chat
        theme: theme, // Sync theme with the app
      };

      let playerOptions;
      if (twitchContent.type === 'channel') {
        playerOptions = { ...commonOptions, channel: twitchContent.id };
      } else if (twitchContent.type === 'video') {
         playerOptions = { ...commonOptions, video: twitchContent.id };
      }

      if (playerOptions) {
        // Use the new Twitch.Embed class
        playerInstanceRef.current = new window.Twitch.Embed(playerContainerRef.current, playerOptions);
      }
    };

    loadTwitchEmbedScript()
      .then(initializePlayer)
      .catch(error => console.error('Error loading or initializing Twitch embed:', error));
    
    return () => {
      isMounted = false;
    };

  }, [twitchContent, theme, hostname]);


  if (!twitchContent) {
    return null;
  }

  // CRITICAL FIX: Wait for hostname before attempting to render the player.
  // This prevents the race condition where an empty `parent` is sent to Twitch.
  if (!hostname) {
    return (
        <div className="w-full max-w-4xl">
            <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-3xl flex items-center justify-center border-4 border-gray-200/20 dark:border-gray-700/40">
                <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
                    Detecting environment...
                </p>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 text-center font-mono">
                <p>
                    <strong>Diagnostic Info:</strong> Waiting for parent domain...
                </p>
            </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl">
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border-4 border-gray-200/20 dark:border-gray-700/40">
        {twitchContent.type === 'clip' ? (
          <iframe
            key={`clip-${twitchContent.id}`}
            src={`https://clips.twitch.tv/embed?clip=${twitchContent.id}&parent=${hostname}&autoplay=true`}
            title="Twitch Clip Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        ) : (
          // This div will be populated by the Twitch.Embed script
          <div ref={playerContainerRef} className="w-full h-full" />
        )}
      </div>
       <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg text-sm text-green-800 dark:text-green-200 text-center font-mono">
          <p>
              <strong>Diagnostic Info:</strong> Attempting to embed for parent domain:
              <br />
              <code className="bg-green-200 dark:bg-green-800 p-1 rounded">
                  {hostname}
              </code>
          </p>
      </div>
    </div>
  );
};

export default VideoPlayer;