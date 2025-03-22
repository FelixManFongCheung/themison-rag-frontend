// components/Chat/index.tsx
"use client"
import { useState, useRef, useEffect } from 'react';
import { useAppState } from '@/src/app/ClientWrapper';

export default function Chat() {
  const { chatHistory, addChatMessage } = useAppState();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, currentAssistantMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to shared state
    const userMessage = input.trim();
    addChatMessage({ role: 'user', content: userMessage });
    setInput('');
    setIsLoading(true);
    setCurrentAssistantMessage('');

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userMessage })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      // For FastAPI streaming responses
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }
      
      const decoder = new TextDecoder();
      let fullMessage = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk
        const text = decoder.decode(value, { stream: true });
        fullMessage += text;
        setCurrentAssistantMessage(fullMessage);
      }
      
      addChatMessage({ role: 'assistant', content: fullMessage });
      setCurrentAssistantMessage('');
    } catch (error) {
      console.error('Error:', error);
      addChatMessage({ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
          </div>
        ) : (
          chatHistory.map((message, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-[80%]' 
                  : 'bg-gray-100 mr-auto max-w-[80%]'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
        
        {currentAssistantMessage && (
          <div className="bg-gray-100 p-3 rounded-lg mr-auto max-w-[80%]">
            <p className="whitespace-pre-wrap">{currentAssistantMessage}</p>
          </div>
        )}
        
        {isLoading && !currentAssistantMessage && (
          <div className="bg-gray-100 p-3 rounded-lg mr-auto">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..." 
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}