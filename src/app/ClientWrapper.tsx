// app/ClientWrapper.tsx
"use client"
import { createContext, useState, useContext } from 'react'
import Upload from '@/components/Upload'
import Chat from '@/components/Chat'

// Create a context for the application state
const AppStateContext = createContext<{
  chatHistory: Array<{ role: string, content: string }>;
  addChatMessage: (message: { role: string, content: string }) => void;

}>({
  chatHistory: [],
  addChatMessage: () => {},

});

// Export a hook to use the context
export const useAppState = () => useContext(AppStateContext);

// Client wrapper component that manages state
export default function ClientWrapper() {
  const [chatHistory, setChatHistory] = useState<Array<{ role: string, content: string }>>([]);

  const addChatMessage = (message: { role: string, content: string }) => {
    setChatHistory(prev => [...prev, message]);
  };

  return (
    <AppStateContext.Provider value={{ 
      chatHistory, 
      addChatMessage, 
    }}>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
            <Upload />
          </div>
          
          {/* Chat section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Ask Questions</h2>
            <Chat />
          </div>
        </div>
      </div>
    </AppStateContext.Provider>
  );
}