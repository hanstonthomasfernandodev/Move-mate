import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { ProgressBar } from '../components/ProgressBar';
import { Countdown } from '../components/Countdown';
import { useHandTracking } from '../hooks/useHandTracking';
import { useDemoMode } from '../hooks/useDemoMode';
import { ACTIVITY_MAP } from '../data/activities';
import { storageService } from '../services/storageService';
import { calculateScore } from '../services/scoringService';
import { generateId, generateRandomTarget, distance, calculateSmoothness } from '../utils/helpers';
import type { MovingTarget as MovingTargetType, GameMetrics, Difficulty } from '../types/game';
import type { HandPosition } from '../hooks/useHandTracking';
import { ArrowLeft } from 'lucide-react';

interface Props {
  difficulty: Difficulty;
  demoMode: boolean;
}

export function MovingTargets({ difficulty, demoMode }: Props) {
  const navigate = useNavigate();
  const activity = ACTIVITY_MAP['moving-targets'];
  const config = activity?.difficulties[difficulty];
  
  const GAME_W = 800;
  const GAME_H = 600;
  
  const [targets, setTargets] = useState<MovingTargetType[]>([]);
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  
  const sessionStartTimeRef = useRef(0);
  const errorsRef = useRef(0);
  const reactionTimesRef = useRef<number[]>([]);
  const fingertipPositionsRef = useRef<{x: number; y: number; timestamp: number}[]>([]);
  const targetShownTimeRef = useRef(0);

  const targetCount = config?.targetCount || 10;
  const targetSize = config?.targetSize || 45;
  const speed = config?.speed || 2;

  const realTracking = useHandTracking({ enabled: !demoMode, gameWidth: GAME_W, gameHeight: GAME_H });
  const demoTracking = useDemoMode(demoMode, GAME_W, GAME_H);
  const tracking = demoMode ? demoTracking : realTracking;

  const spawnTarget = useCallback((idx: number): MovingTargetType => {
    const pos = generateRandomTarget(GAME_W, GAME_H, targetSize);
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.8 + Math.random() * 0.4);
    return {
      id: idx,
      x: pos.x,
      y: pos.y,
      radius: targetSize,
      active: idx === 0,
      hit: false,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
    };
  }, [targetSize, speed]);

  useEffect(() => {
    if (targetCount > 0) {
      setTargets([spawnTarget(0)]);
    }
  }, [targetCount, spawnTarget]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setGameStarted(true);
    sessionStartTimeRef.current = Date.now();
    targetShownTimeRef.current = Date.now();
  }, []);

  const saveResults = useCallback(() => {
    const totalTime = (Date.now() - sessionStartTimeRef.current) / 1000;
    const avgReaction = reactionTimesRef.current.length > 0
      ? reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length
      : 0;
    
    const metrics: GameMetrics = {
      totalTime,
      reactionTimes: reactionTimesRef.current,
      averageReactionTime: avgReaction,
      hits: hits + 1,
      misses: errorsRef.current,
      errors: errorsRef.current,
      accuracy: targetCount > 0 ? ((hits + 1) / targetCount) * 100 : 0,
      movementDistance: 0,
      movementSmoothness: calculateSmoothness(fingertipPositionsRef.current as any),
      pathDeviation: 0,
      completionPercentage: 100,
      score: 0,
      fingertipPositions: fingertipPositionsRef.current as any,
    };
    
    const scoreBreakdown = calculateScore(metrics, targetCount);
    metrics.score = scoreBreakdown.overall;
    
    storageService.saveSession({
      id: generateId(),
      date: new Date().toISOString(),
      activity: 'moving-targets',
      difficulty,
      score: scoreBreakdown.overall,
      accuracy: scoreBreakdown.accuracy,
      completionTime: totalTime,
      reactionTime: avgReaction,
      errors: errorsRef.current,
      movementSmoothness: metrics.movementSmoothness,
      pathDeviation: 0,
      targetsCompleted: hits + 1,
      totalTargets: targetCount,
      completionPercentage: 100,
      movementDistance: metrics.movementDistance,
    });
  }, [difficulty, targetCount, hits]);

  useEffect(() => {
    if (!gameStarted || gameComplete) return;
    
    const interval = setInterval(() => {
      const pos = tracking.getCurrentPosition();
      
      setTargets(prev => {
        return prev.map(t => {
          if (t.hit) return t;
          
          let nx = t.x + t.vx;
          let ny = t.y + t.vy;
          
          if (nx - t.radius < 0 || nx + t.radius > GAME_W) {
            t.vx = -t.vx;
            nx = Math.max(t.radius, Math.min(GAME_W - t.radius, nx));
          }
          if (ny - t.radius < 0 || ny + t.radius > GAME_H) {
            t.vy = -t.vy;
            ny = Math.max(t.radius, Math.min(GAME_H - t.radius, ny));
          }
          
          return { ...t, x: nx, y: ny };
        });
      });
      
      if (pos.detected) {
        fingertipPositionsRef.current.push({ x: pos.x, y: pos.y, timestamp: Date.now() });
        
        setTargets(prev => {
          const updated = [...prev];
          const current = updated[currentTargetIdx];
          
          if (current && !current.hit) {
            const dist = distance(pos, { x: current.x, y: current.y });
            
            if (dist <= current.radius + 15) {
              const reactionTime = (Date.now() - targetShownTimeRef.current) / 1000;
              reactionTimesRef.current.push(reactionTime);
              
              updated[currentTargetIdx] = { ...current, hit: true };
              setHits(h => h + 1);
              
              const nextIdx = currentTargetIdx + 1;
              if (nextIdx < targetCount) {
                setCurrentTargetIdx(nextIdx);
                const newTarget = spawnTarget(nextIdx);
                newTarget.active = true;
                updated.push(newTarget);
                targetShownTimeRef.current = Date.now();
              } else {
                setGameComplete(true);
                saveResults();
              }
            }
          }
          
          return updated;
        });
      }
    }, 33);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete, currentTargetIdx, targetCount, tracking, spawnTarget, saveResults]);

  const renderGame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, _pos: HandPosition) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    
    targets.forEach((target, i) => {
      if (target.hit) return;
      
      const isActive = i === currentTargetIdx;
      
      if (isActive) {
        ctx.fillStyle = 'rgba(79, 70, 229, 0.05)';
        ctx.beginPath();
        ctx.arc(target.x - target.vx * 3, target.y - target.vy * 3, target.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      if (isActive) {
        const gradient = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, target.radius + 12);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius + 12, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = isActive ? '#06b6d4' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = isActive ? '#22d3ee' : '#cbd5e1';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = isActive ? '#fff' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [targets, currentTargetIdx]);

  if (gameComplete) {
    navigate(`/results/moving-targets?difficulty=${difficulty}&demo=${demoMode}`);
    return null;
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-darker min-h-screen">
      <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/activities')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h2 className="font-semibold text-text-primary">Moving Targets</h2>
        <div className="text-sm text-text-secondary">
          Caught {hits} / {targetCount}
        </div>
      </div>
      
      <div className="px-4 py-2 bg-white border-b border-border">
        <ProgressBar current={hits} total={targetCount} />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {showCountdown && <Countdown onComplete={handleCountdownComplete} />}
          
          <GameCanvas
            width={GAME_W}
            height={GAME_H}
            getPosition={tracking.getSmoothedPosition}
            handDetected={tracking.handDetected}
            renderGame={renderGame}
          />
        </div>
      </div>
    </div>
  );
}
