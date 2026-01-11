import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import gateBackground from '@/assets/gate-background.png';

const ACCESS_KEY = "kleinman";

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('access_authenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.toLowerCase() === ACCESS_KEY.toLowerCase()) {
      localStorage.setItem('access_authenticated', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setInputKey('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#f5f5f0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Full-screen background image */}
      <img
        src={gateBackground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-xs px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label 
              htmlFor="access-key" 
              className="block text-xs tracking-[0.2em] uppercase text-[#f5f5f0]/70 font-light"
            >
              What is the key?
            </label>
            <Input
              id="access-key"
              type="password"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setError(false);
              }}
              className="h-12 bg-transparent border-0 border-b-2 border-[#f5f5f0]/50 rounded-none px-0 text-lg font-light tracking-wide text-[#f5f5f0] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#f5f5f0] placeholder:text-[#f5f5f0]/40"
              placeholder="•••••••"
              autoComplete="off"
            />
            {error && (
              <p className="text-xs tracking-wide text-red-400 font-light">
                Incorrect key
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#f5f5f0] hover:bg-[#e5e5e0] text-[#1a1a1a] rounded-none text-xs tracking-[0.15em] uppercase font-light transition-colors duration-300"
          >
            Enter
          </Button>
        </form>

        {/* Minimal footer */}
        <p className="mt-16 text-center text-[10px] tracking-[0.3em] uppercase text-[#f5f5f0]/50 font-light">
          Private Access
        </p>
      </div>
    </div>
  );
}
