
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { APIKeyManager } from '@/components/APIKeyManager';
import { Separator } from '@/components/ui/separator';
import { User, Settings as SettingsIcon, Key, LogOut, ArrowLeft, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useUsageTracking } from '@/hooks/useUsageTracking';

const Settings = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Check for user API keys
  const userOpenaiKey = localStorage.getItem('user_openai_api_key');
  const userAnthropicKey = localStorage.getItem('user_anthropic_api_key');
  const userGeminiKey = localStorage.getItem('user_gemini_api_key');
  const hasUserApiKeys = !!(userOpenaiKey || userAnthropicKey || userGeminiKey);

  // Get usage tracking data
  const { usageCount } = useUsageTracking(hasUserApiKeys);
  const DAILY_CREDIT_LIMIT = 5;
  const remainingCredits = DAILY_CREDIT_LIMIT - usageCount;

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in (after loading is complete)
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Video Hub</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Account Settings
              </h1>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Account Information</span>
                </CardTitle>
                <CardDescription>
                  Your account details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Email Address</p>
                    <p className="text-slate-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">User ID</p>
                    <p className="text-xs text-slate-500 font-mono">{user.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Account Created</p>
                    <p className="text-slate-600">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">Last Sign In</p>
                    <p className="text-slate-600">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Usage & Credits</span>
                </CardTitle>
                <CardDescription>
                  Your AI assistant usage and credit information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!hasUserApiKeys && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900">Daily Credits Usage</h4>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-900">{usageCount}</span>
                          <span className="text-blue-700">/{DAILY_CREDIT_LIMIT}</span>
                        </div>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(usageCount / DAILY_CREDIT_LIMIT) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-blue-800">
                        <span>Credits used today</span>
                        <span>{remainingCredits} remaining</span>
                      </div>
                    </div>
                  )}
                  
                  {hasUserApiKeys && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Unlimited Usage Active</h4>
                      <p className="text-sm text-green-800">
                        You're using your own API keys, so you have unlimited AI assistant usage.
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-700 mb-2">About Credits</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• You receive 5 free AI assistant credits daily</li>
                      <li>• Credits reset every day at midnight UTC</li>
                      <li>• Add your own API keys below for unlimited usage</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Keys Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>API Keys</span>
                </CardTitle>
                <CardDescription>
                  Manage your AI service API keys for unlimited usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Why add your own API keys?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Get unlimited AI assistant usage (no daily credit limits)</li>
                      <li>• Faster response times and priority access</li>
                      <li>• Support for latest AI models and features</li>
                      <li>• Your keys are stored securely in your browser only</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-center">
                    <APIKeyManager />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Account Actions</CardTitle>
                <CardDescription>
                  Manage your account and session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
