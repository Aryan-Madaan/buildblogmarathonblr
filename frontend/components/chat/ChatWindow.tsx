
import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import { useAuth } from '../../context/AuthContext';
import { useTripContext } from '../../context/TripContext';
import { Message } from '../../types';
import { UserGroupIcon } from '../ui/Icons';
import { InviteModal } from '../planner/InviteModal';

export const ChatWindow = () => {
  const { user } = useAuth();
  const { activeTrip, addMessageToActiveTrip } = useTripContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  const { isLoading, sendMessage } = useGeminiChat(user!, activeTrip?.messages || [], addMessageToActiveTrip);

  useEffect(() => {
    if (user && activeTrip && activeTrip.messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome-0',
        author: 'ai',
        content: `Hi ${user.name}! I'm Safar, your personal trip planner. ✈️\n\nI see you're planning a trip to ${activeTrip.title.replace('Trip to ','')}. What kind of adventure are you dreaming of?`,
        authorName: 'Safar',
        authorAvatar: `https://api.dicebear.com/8.x/bottts/svg?seed=Safar`,
      };
      addMessageToActiveTrip(welcomeMessage);
    }
  }, [user, activeTrip, addMessageToActiveTrip]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTrip?.messages]);

  const handleSend = async (text: string) => {
    if (!user) return;
    await sendMessage(text);
  };

  if (!activeTrip) {
    return <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900 text-gray-500">Select or create a trip to begin.</div>;
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold">{activeTrip.title}</h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              {activeTrip.participants.map(p => p.name).join(', ')}
            </div>
          </div>
          <button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <UserGroupIcon className="w-5 h-5" />
            Invite
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {activeTrip.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <MessageBubble message={{ id: 'loading', author: 'ai', content: '...', authorName: 'Safar', authorAvatar: `https://api.dicebear.com/8.x/bottts/svg?seed=Safar` }} />
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
      {isInviteModalOpen && <InviteModal onClose={() => setInviteModalOpen(false)} />}
    </>
  );
};
