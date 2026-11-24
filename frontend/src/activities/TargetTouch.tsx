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
import type { Target, GameMetrics, Difficulty } from '../types/game';
import type { HandPosition } from '../hooks/useHandTracking';
import { ArrowLeft } from 'lucide-react';

interface Props {
  difficulty: Difficulty;
  demoMode: boolean;
}

export function TargetTouch({ difficulty, demoMode }: Props) {
  const navigate = useNavigate();
  const activity = ACTIVITY_MAP['target-touch'];
  const config = activity?.difficulties[difficulty];
  
  const GAME_W = 800;
  const GAME_H = 600;
  
  const [targets, setTargets] = useState<Target[]>([]);
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const reactionTimesRef = useRef<number[]>([]);
  const fingertipPositionsRef = useRef<{x: number; y: number; timestamp: number}[]>([]);
  const targetShownTimeRef = useRef(0);
  const totalTimeRef = useRef(0);

  const targetCount = config?.targetCount || 10;
  const targetSize = config?.targetSize || 50;

  const realTracking = useHandTracking({ enabled: !demoMode, gameWidth: GAME_W, gameHeight: GAME_H });
  const demoTracking = useDemoMode(demoMode, GAME_W, GAME_H);
  const tracking = demoMode ? demoTracking : realTracking;

  // Generate targets
  useEffect(() => {
    const newTargets: Target[] = [];
    for (let i = 0; i < targetCount; i++) {
      const pos = generateRandomTarget(GAME_W, GAME_H, targetSize);
      newTargets.push({
        id: i,
        x: pos.x,
        y: pos.y,
        radius: targetSize,
        active: i === 0,
        hit: false,
      });
    }
    setTargets(newTargets);
  }, [targetCount, targetSize]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setGameStarted(true);
    setSessionStartTime(Date.now());
    targetShownTimeRef.current = Date.now();
  }, []);

  // Check for target hits
  useEffect(() => {
    if (!gameStarted || gameComplete) return;
    
    const interval = setInterval(() => {
      const pos = tracking.getCurrentPosition();
      if (!pos.detected) return;
      
      fingertipPositionsRef.current.push({ x: pos.x, y: pos.y, timestamp: Date.now() });
      
      setTargets(prev => {
        const updated = [...prev];
        const current = updated[currentTargetIdx];
        
        if (current && !current.hit) {
          const dist = distance(pos, { x: current.x, y: current.y });
          
          if (dist <= current.radius + 15) {
            const reactionTime = (Date.now() - targetShownTimeRef.current) / 1000;
            reactionTimesRef.current.push(reactionTime);
            hitsRef.current++;
            
            updated[currentTargetIdx] = { ...current, hit: true, hitTime: Date.now() };
            
            const nextIdx = currentTargetIdx + 1;
            if (nextIdx < targetCount) {
              setCurrentTargetIdx(nextIdx);
              updated[nextIdx] = { ...updated[nextIdx], active: true };
              targetShownTimeRef.current = Date.now();
            } else {
              totalTimeRef.current = (Date.now() - sessionStartTime) / 1000;
              setGameComplete(true);
              
              const metrics: GameMetrics = {
                totalTime: totalTimeRef.current,
                reactionTimes: reactionTimesRef.current,
                averageReactionTime: reactionTimesRef.current.length > 0
                  ? reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length
                  : 0,
                hits: hitsRef.current,
                misses: missesRef.current,
                errors: missesRef.current,
                accuracy: targetCount > 0 ? (hitsRef.current / targetCount) * 100 : 0,
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
                activity: 'target-touch',
                difficulty,
                score: scoreBreakdown.overall,
                accuracy: scoreBreakdown.accuracy,
                completionTime: totalTimeRef.current,
                reactionTime: metrics.averageReactionTime,
                errors: missesRef.current,
                movementSmoothness: metrics.movementSmoothness,
                pathDeviation: 0,
                targetsCompleted: hitsRef.current,
                totalTargets: targetCount,
                completionPercentage: 100,
                movementDistance: metrics.movementDistance,
              });
            }
          }
        }
        
        return updated;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete, currentTargetIdx, targetCount, difficulty, sessionStartTime, tracking]);

  const renderGame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, _pos: HandPosition) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    
    targets.forEach((target, i) => {
      if (target.hit) return;
      
      const gradient = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, target.radius + 10);
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.15)');
      gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius + 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = i === currentTargetIdx ? '#4f46e5' : '#c7d2fe';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = i === currentTargetIdx ? '#818cf8' : '#e0e7ff';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = i === currentTargetIdx ? '#fff' : '#a5b4fc';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [targets, currentTargetIdx]);

  if (gameComplete) {
    navigate(`/results/target-touch?difficulty=${difficulty}&demo=${demoMode}`);
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
        <h2 className="font-semibold text-text-primary">Target Touch</h2>
        <div className="text-sm text-text-secondary">
          Target {Math.min(currentTargetIdx + 1, targetCount)} / {targetCount}
        </div>
      </div>
      
      <div className="px-4 py-2 bg-white border-b border-border">
        <ProgressBar current={currentTargetIdx} total={targetCount} />
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
