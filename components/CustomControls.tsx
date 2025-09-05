import React from 'react';

interface CustomControlsProps {
  isPlaying: boolean;
  progress: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFullScreen: () => void;
  isVisible: boolean;
}

// Icons
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
);
const FullScreenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5" /></svg>
);

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const CustomControls: React.FC<CustomControlsProps> = ({ isPlaying, progress, duration, onPlayPause, onSeek, onFullScreen, isVisible }) => {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 m-4 transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-3 flex items-center gap-4 text-white">
        <button onClick={onPlayPause} className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500">
          {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>

        <span className="text-sm font-mono w-14 text-center">{formatTime(progress)}</span>
        
        <input
          type="range"
          min="0"
          max={duration}
          value={progress}
          onChange={onSeek}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500 bg-white/20 hover:accent-purple-400"
          aria-label="Video progress bar"
        />
        
        <span className="text-sm font-mono w-14 text-center">{formatTime(duration)}</span>

        <button onClick={onFullScreen} className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500">
          <FullScreenIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default CustomControls;