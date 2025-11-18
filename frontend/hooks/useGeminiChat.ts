
import { useState, useMemo } from 'react';
import { GoogleGenAI, Chat, Message as GeminiMessage } from '@google/genai';
import { Message, User } from '../types';
import { SYSTEM_INSTRUCTION, GEMINI_API_KEY } from '../constants';

const API_KEY = GEMINI_API_KEY;

export const useGeminiChat = (
    user: User,
    initialMessages: Message[],
    addMessage: (message: Message) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ai = useMemo(() => {
    if (!API_KEY) {
      console.error("API_KEY is not set. Please check your constants.ts file or build environment variables.");
      return null;
    }
    return new GoogleGenAI({ apiKey: API_KEY, vertexai: true });
  }, []);

  const chat: Chat | null = useMemo(() => {
    if (!ai) return null;
    
    const history: GeminiMessage[] = initialMessages
        .filter(msg => msg.author !== 'system')
        .map(msg => ({
            role: msg.author === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history
    });
  }, [ai, initialMessages]);

  const sendMessage = async (text: string) => {
    if (!chat) {
      const errorMsg = "Chat is not initialized. Is the API key missing?";
      setError(errorMsg);
      console.error(errorMsg);
      addMessage({ id: Date.now().toString(), author: 'system', content: 'Error: Could not connect to AI service.', authorName: 'System', authorAvatar: '' });
      return;
    }

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      author: 'user',
      content: text,
      authorName: user.name,
      authorAvatar: user.avatar,
    };
    addMessage(userMessage);

    try {
      const stream = await chat.sendMessageStream({ message: text });
      
      let aiResponse = '';
      const aiMessageId = (Date.now() + 1).toString();
      const authorAvatar = `https://api.dicebear.com/8.x/bottts/svg?seed=Safar`;
      
      // Add a placeholder for the AI message
      addMessage({
        id: aiMessageId,
        author: 'ai',
        content: '',
        authorName: 'Safar',
        authorAvatar,
      });

      for await (const chunk of stream) {
        aiResponse += chunk.text;
        addMessage({
            id: aiMessageId,
            author: 'ai',
            content: aiResponse,
            authorName: 'Safar',
            authorAvatar,
        });
      }

    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMsg);
      addMessage({ id: (Date.now() + 1).toString(), author: 'system', content: `Sorry, I encountered an error: ${errorMsg}`, authorName: 'System', authorAvatar: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, sendMessage };
};
