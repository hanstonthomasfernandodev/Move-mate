import { useState, useEffect } from 'react';

interface CountdownProps {
  from?: number;
  onComplete: () => void;
}

export function Countdown({ from = 3, onComplete }: CountdownProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="text-white text-9xl font-bold animate-pulse">
        {count}
      </div>
    </div>
  );
}
