import { useEffect, useRef, useState, useCallback } from 'react';
import type { HandPosition } from './useHandTracking';

export function useDemoMode(enabled: boolean, gameWidth: number, gameHeight: number) {
  const [handDetected, setHandDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const positionRef = useRef<HandPosition>({ x: gameWidth / 2, y: gameHeight / 2, detected: true, timestamp: Date.now() });
  const targetRef = useRef({ x: gameWidth / 2, y: gameHeight / 2 });
  const frameRef = useRef<number>(0);

  const getCurrentPosition = useCallback(() => positionRef.current, []);

  const getSmoothedPosition = useCallback(() => positionRef.current, []);

  useEffect(() => {
    if (!enabled) return;
    
    setLoading(true);
    const loadTimer = setTimeout(() => {
      setLoading(false);
      setHandDetected(true);
    }, 800);

    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      const current = positionRef.current;
      const target = targetRef.current;
      
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 20) {
        targetRef.current = {
          x: 100 + Math.random() * (gameWidth - 200),
          y: 100 + Math.random() * (gameHeight - 200),
        };
      }
      
      const speed = 150;
      const moveAmount = Math.min(speed * dt, dist);
      
      if (dist > 0) {
        positionRef.current = {
          x: current.x + (dx / dist) * moveAmount,
          y: current.y + (dy / dist) * moveAmount,
          detected: true,
          timestamp: Date.now(),
        };
      }
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      clearTimeout(loadTimer);
      cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, gameWidth, gameHeight]);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
  }, []);

  return {
    videoRef: { current: null },
    canvasRef: { current: null },
    handDetected,
    loading,
    error: null,
    getCurrentPosition,
    getSmoothedPosition,
    cleanup,
    cameraWidth: 640,
    cameraHeight: 480,
  };
}
