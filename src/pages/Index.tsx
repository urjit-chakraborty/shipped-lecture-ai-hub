
import { Play, Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder data for lectures
const lectures = [
  {
    id: 1,
    title: "Getting Started with Lovable",
    description: "Learn the fundamentals of building web applications with Lovable's AI-powered development platform.",
    duration: "45 min",
    releaseDate: "2024-01-15",
    thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=225&fit=crop",
    category: "Beginner",
    views: "1.2k"
  },
  {
    id: 2,
    title: "Advanced React Patterns in Lovable",
    description: "Dive deep into advanced React patterns and how to implement them effectively using Lovable.",
    duration: "60 min",
    releaseDate: "2024-01-22",
    thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=225&fit=crop",
    category: "Advanced",
    views: "890"
  },
  {
    id: 3,
    title: "Building Full-Stack Apps",
    description: "Complete guide to building full-stack applications with modern tools and best practices.",
    duration: "75 min",
    releaseDate: "2024-01-29",
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop",
    category: "Intermediate",
    views: "2.1k"
  },
  {
    id: 4,
    title: "Deployment Strategies",
    description: "Learn various deployment strategies and best practices for production applications.",
    duration: "50 min",
    releaseDate: "2024-02-05",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    category: "Intermediate",
    views: "756"
  }
];

const Index = () => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Beginner":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Advanced":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Lovable Shipped
                </h1>
                <p className="text-sm text-slate-600">Lecture Hub</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Lectures
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">
                Calendar
              </a>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Settings
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Master Modern Web Development
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Access comprehensive video lectures, interactive AI assistance, and hands-on learning materials 
            to accelerate your development journey with Lovable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3">
              <Play className="w-5 h-5 mr-2" />
              Start Learning
            </Button>
            <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3">
              <Calendar className="w-5 h-5 mr-2" />
              View Schedule
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
            <div className="text-slate-600">Video Lectures</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-200">
            <div className="text-3xl font-bold text-indigo-600 mb-2">5k+</div>
            <div className="text-slate-600">Students</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
            <div className="text-slate-600">Powered Chat</div>
          </div>
        </div>
      </section>

      {/* Lectures Grid */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Featured Lectures</h3>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lectures.map((lecture) => (
            <Card key={lecture.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-200 overflow-hidden">
              <div className="relative">
                <img 
                  src={lecture.thumbnail} 
                  alt={lecture.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute top-3 right-3">
                  <Badge className={getCategoryColor(lecture.category)}>
                    {lecture.category}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-white text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{lecture.duration}</span>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                  {lecture.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {lecture.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{lecture.views} views</span>
                  </div>
                  <span>{new Date(lecture.releaseDate).toLocaleDateString()}</span>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Lecture
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already learning and building amazing applications with our comprehensive video series.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">Lovable Shipped</span>
              </div>
              <p className="text-sm">
                Your go-to resource for modern web development education and AI-powered learning assistance.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">All Lectures</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Release Calendar</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Getting Started</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API Settings</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Lovable Shipped Lecture Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
