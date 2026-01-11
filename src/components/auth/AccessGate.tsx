import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ACCESS_KEY = "kleinman"; // Simple access key

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
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-8">
      {/* Image Container */}
      <div className="w-full max-w-2xl mb-16">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Paul_Strand%2C_Wall_Street%2C_1915.jpg/1200px-Paul_Strand%2C_Wall_Street%2C_1915.jpg"
          alt="Wall Street"
          className="w-full h-auto grayscale"
          style={{ filter: 'grayscale(100%) sepia(20%)' }}
        />
      </div>

      {/* Access Form - Dieter Rams inspired minimalism */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6">
        <div className="space-y-3">
          <label 
            htmlFor="access-key" 
            className="block text-xs tracking-[0.2em] uppercase text-[#666] font-light"
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
            className="h-12 bg-transparent border-0 border-b-2 border-[#1a1a1a] rounded-none px-0 text-lg font-light tracking-wide focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#1a1a1a] placeholder:text-[#999]"
            placeholder="•••••••"
            autoComplete="off"
          />
          {error && (
            <p className="text-xs tracking-wide text-[#a33] font-light">
              Incorrect key
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-[#1a1a1a] hover:bg-[#333] text-[#f5f5f0] rounded-none text-xs tracking-[0.15em] uppercase font-light transition-colors duration-300"
        >
          Enter
        </Button>
      </form>

      {/* Minimal footer */}
      <p className="mt-16 text-[10px] tracking-[0.3em] uppercase text-[#999] font-light">
        Private Access
      </p>
    </div>
  );
}
