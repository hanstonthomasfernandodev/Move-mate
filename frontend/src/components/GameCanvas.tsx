import { useRef, useEffect, useCallback } from 'react';
import type { HandPosition } from '../hooks/useHandTracking';

interface GameCanvasProps {
  width: number;
  height: number;
  getPosition: () => HandPosition;
  handDetected: boolean;
  renderGame: (ctx: CanvasRenderingContext2D, width: number, height: number, position: HandPosition) => void;
}

export function GameCanvas({ width, height, getPosition, handDetected, renderGame }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const position = getPosition();
    
    ctx.clearRect(0, 0, width, height);
    
    renderGame(ctx, width, height, position);
    
    if (position.detected) {
      ctx.beginPath();
      ctx.arc(position.x, position.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.15)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(position.x, position.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.7)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(position.x, position.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#4f46e5';
      ctx.fill();
    }
    
    frameRef.current = requestAnimationFrame(animate);
  }, [width, height, getPosition, renderGame]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-surface-darker border border-border">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full"
        style={{ aspectRatio: `${width}/${height}` }}
      />
      
      {!handDetected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-text-secondary shadow-sm">
          ✋ Place your hand in the camera view
        </div>
      )}
    </div>
  );
}
