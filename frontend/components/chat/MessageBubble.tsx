
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useAuth();
  const isCurrentUser = message.author === 'user' && message.authorName === user?.name;
  const isSystem = message.author === 'system';

  if (isSystem) {
    return (
      <div className="text-center my-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{message.content}</span>
      </div>
    );
  }

  const contentWithoutActions = message.content.replace(/\[BOOK_.*?:"(.*?)"]/g, '');

  return (
    <div className={`flex items-start gap-3 my-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <img src={message.authorAvatar} alt={message.authorName} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      )}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-lg p-3 rounded-2xl shadow ${
            isCurrentUser
              ? 'bg-teal-600 text-white rounded-br-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'
          }`}
        >
          <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-2 prose-li:my-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {contentWithoutActions}
            </ReactMarkdown>
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{message.authorName}</span>
      </div>
      {isCurrentUser && (
        <img src={message.authorAvatar} alt={message.authorName} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      )}
    </div>
  );
};
