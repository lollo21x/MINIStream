import React from 'react';
import { PlayerMode } from '../types';

interface PlayerModeToggleProps {
  playerMode: PlayerMode;
  togglePlayerMode: () => void;
  disabled: boolean;
}

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


const PlayerModeToggle: React.FC<PlayerModeToggleProps> = ({ playerMode, togglePlayerMode, disabled }) => {
  const title = disabled
    ? "Chat is only available for live channels"
    : playerMode === 'minimal'
    ? "Show video with chat"
    : "Show video only";

  return (
    <button
      onClick={togglePlayerMode}
      disabled={disabled}
      className="p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-gray-700 dark:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Toggle player mode"
      title={title}
    >
      {playerMode === 'minimal' ? (
        <ChatIcon className="w-6 h-6" />
      ) : (
        <VideoIcon className="w-6 h-6" />
      )}
    </button>
  );
};

export default PlayerModeToggle;
