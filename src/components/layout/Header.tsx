
import { useState } from "react";
import { Menu, X, MessageCircle, Calendar, Rocket, LogIn, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { APIKeyManager } from "@/components/APIKeyManager";
import { useAuth } from "@/contexts/AuthContext";
import { smoothScrollToSection } from "@/utils/smoothScroll";
import { toast } from "sonner";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleVideosClick = (e: React.MouseEvent) => {
    e.preventDefault();
    smoothScrollToSection('featured-videos');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lovable Shipped
              </h1>
              <p className="text-sm text-slate-600">Video Hub</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#" 
              className="text-slate-600 hover:text-blue-600 transition-colors duration-200"
              onClick={handleVideosClick}
            >
              Videos
            </a>
            <a href="/calendar" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
              Calendar
            </a>
            
            {user && <APIKeyManager />}
            
            <Button asChild variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <a href="/chat">
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Assistant
              </a>
            </Button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                  <a href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </a>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-slate-600 hover:text-blue-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <a href="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </a>
              </Button>
            )}
          </nav>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600">
                  <Menu className="w-6 h-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle>Navigation</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                      <X className="w-5 h-5" />
                    </Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="px-4 pb-6 space-y-4">
                  <a 
                    href="#" 
                    className="block py-3 text-lg text-slate-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={(e) => {
                      handleVideosClick(e);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Videos
                  </a>
                  <a 
                    href="/calendar" 
                    className="block py-3 text-lg text-slate-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Calendar
                  </a>
                  
                  {user && (
                    <div className="py-3">
                      <APIKeyManager />
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      asChild
                      variant="outline" 
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <a href="/chat">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        AI Assistant
                      </a>
                    </Button>
                  </div>

                  {user ? (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <Button 
                        asChild
                        variant="ghost" 
                        className="w-full justify-start text-slate-600 hover:text-blue-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <a href="/settings">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-slate-600 hover:text-blue-600"
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t">
                      <Button 
                        asChild
                        variant="outline" 
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <a href="/auth">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
};
