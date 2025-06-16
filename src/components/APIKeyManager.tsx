
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const APIKeyManager = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedOpenaiKey = localStorage.getItem('user_openai_api_key') || '';
    const savedAnthropicKey = localStorage.getItem('user_anthropic_api_key') || '';
    const savedGeminiKey = localStorage.getItem('user_gemini_api_key') || '';
    setOpenaiKey(savedOpenaiKey);
    setAnthropicKey(savedAnthropicKey);
    setGeminiKey(savedGeminiKey);
  }, []);

  const saveApiKey = (keyType: 'openai' | 'anthropic' | 'gemini', value: string) => {
    if (value.trim()) {
      localStorage.setItem(`user_${keyType}_api_key`, value.trim());
      toast.success(`${keyType === 'openai' ? 'OpenAI' : keyType === 'anthropic' ? 'Anthropic' : 'Gemini'} API key saved successfully`);
    } else {
      localStorage.removeItem(`user_${keyType}_api_key`);
      toast.success(`${keyType === 'openai' ? 'OpenAI' : keyType === 'anthropic' ? 'Anthropic' : 'Gemini'} API key removed`);
    }
  };

  const handleSave = () => {
    saveApiKey('openai', openaiKey);
    saveApiKey('anthropic', anthropicKey);
    saveApiKey('gemini', geminiKey);
    setIsOpen(false);
  };

  const clearKey = (keyType: 'openai' | 'anthropic' | 'gemini') => {
    if (keyType === 'openai') {
      setOpenaiKey('');
      localStorage.removeItem('user_openai_api_key');
    } else if (keyType === 'anthropic') {
      setAnthropicKey('');
      localStorage.removeItem('user_anthropic_api_key');
    } else {
      setGeminiKey('');
      localStorage.removeItem('user_gemini_api_key');
    }
    toast.success(`${keyType === 'openai' ? 'OpenAI' : keyType === 'anthropic' ? 'Anthropic' : 'Gemini'} API key cleared`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
          <Settings className="w-4 h-4 mr-2" />
          API Keys
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage API Keys</DialogTitle>
          <CardDescription>
            Enter your own API keys to use AI features. Keys are stored locally in your browser.
          </CardDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* OpenAI API Key */}
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="openai-key"
                  type={showOpenaiKey ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  >
                    {showOpenaiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  {openaiKey && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => clearKey('openai')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Anthropic API Key */}
          <div className="space-y-2">
            <Label htmlFor="anthropic-key">Anthropic API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="anthropic-key"
                  type={showAnthropicKey ? "text" : "password"}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  >
                    {showAnthropicKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  {anthropicKey && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => clearKey('anthropic')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Get your API key from{' '}
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Anthropic Console
              </a>
            </p>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Gemini API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="gemini-key"
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AI..."
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                  >
                    {showGeminiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  {geminiKey && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => clearKey('gemini')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Get your API key from{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Keys
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
