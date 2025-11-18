
import React, { useState } from 'react';
import { SendIcon, Spinner } from '../ui/Icons';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask Safar to plan your trip..."
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          rows={1}
          disabled={isLoading}
          aria-label="Chat message input"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !text.trim()}
          aria-label="Send message"
        >
          {isLoading ? <Spinner className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
        </button>
      </div>
    </form>
  );
};
