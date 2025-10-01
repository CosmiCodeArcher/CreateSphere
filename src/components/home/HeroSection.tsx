import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 py-24 md:py-32 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Decentralized crowdfunding for creators</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Fund Your Dreams on the{" "}
            <span className="text-gradient">Blockchain</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            CreateSphere connects creators with backers through transparent, trustless smart contracts. 
            No intermediaries. Just pure innovation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/discover">
              <Button variant="gradient" size="xl" className="group">
                Discover Projects
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="glass" size="xl">
                Start Your Project
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="glass-card p-6 rounded-xl space-y-2 hover:scale-105 transition-transform">
              <div className="gradient-primary w-12 h-12 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">100% Transparent</h3>
              <p className="text-sm text-muted-foreground">
                All transactions on-chain, verifiable by anyone
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-2 hover:scale-105 transition-transform">
              <div className="gradient-secondary w-12 h-12 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Smart Milestones</h3>
              <p className="text-sm text-muted-foreground">
                Funds released automatically based on progress
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-2 hover:scale-105 transition-transform">
              <div className="gradient-accent w-12 h-12 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Global Access</h3>
              <p className="text-sm text-muted-foreground">
                Anyone with a wallet can participate, anywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
