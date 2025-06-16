
import { Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CallToAction = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="w-8 h-8" />
        </div>
        <h3 className="text-3xl font-bold mb-4">Ready to Ship Your Next Project?</h3>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of developers who are shipping faster than ever with Lovable. 
          Learn the tools, techniques, and mindset that accelerate development from idea to deployment.
        </p>
        <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
          <Zap className="w-5 h-5 mr-2" />
          Start Building Today
        </Button>
      </div>
    </section>
  );
};
