import { Rocket, Play, Calendar, MessageCircle, Coffee, Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">Lovable Shipped</span>
            </div>
            <p className="text-sm mb-4">
              Watch developers ship web applications at lightning speed with Lovable. Learn the strategies and techniques that turn ideas into deployed products.
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://github.com/urjit-chakraborty/shipped-lecture-ai-hub" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://x.com/urjiitt" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Videos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><Play className="w-4 h-4 mr-2" />Latest Videos</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Getting Started</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Advanced Techniques</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Best Practices</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/calendar" className="hover:text-blue-400 transition-colors flex items-center"><Calendar className="w-4 h-4 mr-2" />Release Calendar</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><MessageCircle className="w-4 h-4 mr-2" />AI Assistant</a></li>
              <li><a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Lovable Platform</a></li>
              <li><a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://coff.ee/urjitc" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center"><Coffee className="w-4 h-4 mr-2" />Support me to keep this site running for free</a></li>
              <li><a href="https://discord.com/channels/1119885301872070706/1280461670979993613" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Discord Community</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 Lovable Shipped Video Hub. Built with ❤️ using Lovable.</p>
        </div>
      </div>
    </footer>
  );
};
