
import { Play, Calendar, Rocket, Zap, Coffee, Github, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { smoothScrollToSection } from "@/utils/smoothScroll";

export const Hero = () => {
  const handleSeeVideosClick = () => {
    smoothScrollToSection('featured-videos');
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Rocket className="w-8 h-8 text-blue-600" />
          <Zap className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
          Ship Faster with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lovable</span>
        </h2>
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          Watch how top developers ship web applications at lightning speed. Learn the strategies, 
          tools, and techniques that turn ideas into deployed products in record time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
            onClick={handleSeeVideosClick}
          >
            <Play className="w-5 h-5 mr-2" />
            See Videos
          </Button>
          <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3">
            <Calendar className="w-5 h-5 mr-2" />
            View Schedule
          </Button>
        </div>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-center">
          <CardContent className="p-6">
            <Coffee className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Support the Creator</h3>
            <p className="text-amber-700 mb-4">Support me to keep this site running for free</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
              <a href="https://coff.ee/urjitc" target="_blank" rel="noopener noreferrer">
                <Coffee className="w-4 h-4 mr-2" />
                Buy Me a Coffee
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 text-center">
          <CardContent className="p-6">
            <Github className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Star on GitHub</h3>
            <p className="text-slate-700 mb-4">Star/Contribute to the open source project</p>
            <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
              <a href="https://github.com/urjit-chakraborty/shipped-lecture-ai-hub" target="_blank" rel="noopener noreferrer">
                <Star className="w-4 h-4 mr-2" />
                Star on GitHub
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
