import React, { useState } from 'react';

interface InputBarProps {
  onSubmit: (url: string) => void;
  onInputChange: () => void;
  hasError: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSubmit, onInputChange, hasError }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    onInputChange();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
      <input
        type="text"
        value={url}
        onChange={handleChange}
        placeholder="Paste a Twitch link or enter a channel name..."
        className={`w-full px-4 py-3 bg-gray-100/50 dark:bg-gray-900/50 border-2 rounded-2xl text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 outline-none ${
          hasError ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-purple-500'
        }`}
        aria-invalid={hasError}
      />
      <button
        type="submit"
        className="px-6 py-3 bg-purple-600 hover:brightness-110 text-white font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105"
      >
        Watch
      </button>
    </form>
  );
};

export default InputBar;