import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Wallet } from "lucide-react";
import { useState } from "react";
import { useWeb3 } from "@/hooks/useWeb3";

export const Header = () => {
  const location = useLocation();
  const { connect, disconnect, account, isConnected } = useWeb3();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="gradient-primary p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Rocket className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">CreateSphere</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/discover"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/discover") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Discover
            </Link>
            <Link
              to="/create"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/create") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Start a Project
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <Button variant="glass" size="sm" className="gap-2" onClick={disconnect}>
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">{`${account?.slice(0, 6)}...${account?.slice(-4)}`}</span>
              </Button>
            ) : (
              <Button 
                variant="gradient" 
                size="sm" 
                className="gap-2"
                onClick={connect}
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
