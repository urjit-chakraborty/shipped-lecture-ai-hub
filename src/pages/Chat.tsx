
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, Plus, Trash2, LogIn } from 'lucide-react';
import { AIChat } from '@/components/AIChat';
import { useChatHistory } from '@/hooks/useChatHistory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  
  const {
    chats,
    createNewChat,
    deleteChat,
    currentChat
  } = useChatHistory(selectedChatId);

  const handleCreateNewChat = () => {
    const newChatId = createNewChat();
    setSelectedChatId(newChatId);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Video Hub</span>
              </Button>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
              </div>
            </div>

            <Card className="h-[600px] flex flex-col items-center justify-center">
              <CardContent className="text-center">
                <LogIn className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                <p className="text-muted-foreground mb-6">
                  Please sign in to your account to start chatting with the AI assistant.
                </p>
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Video Hub</span>
            </Button>
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Assistant
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Chat History Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Chat History</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNewChat}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] px-4">
                  {chats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No chats yet</p>
                      <p className="text-xs">Start a new conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedChatId === chat.id
                              ? 'bg-blue-100 border border-blue-200'
                              : 'hover:bg-slate-50'
                          }`}
                          onClick={() => setSelectedChatId(chat.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {chat.title || 'New Chat'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(chat.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              {selectedChatId || currentChat ? (
                <AIChat 
                  key={selectedChatId || currentChat?.id}
                  chatId={selectedChatId || currentChat?.id}
                  preselectedEventIds={[]} 
                />
              ) : (
                <Card className="h-full flex flex-col items-center justify-center">
                  <CardContent className="text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                    <h3 className="text-xl font-semibold mb-2">Welcome to AI Assistant</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Start a new conversation or select an existing chat from the sidebar to continue.
                    </p>
                    <Button onClick={handleCreateNewChat} className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Start New Chat</span>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
