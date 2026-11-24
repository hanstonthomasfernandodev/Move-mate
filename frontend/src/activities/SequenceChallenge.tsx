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

export function SequenceChallenge({ difficulty, demoMode }: Props) {
  const navigate = useNavigate();
  const activity = ACTIVITY_MAP['sequence-challenge'];
  const config = activity?.difficulties[difficulty];
  
  const GAME_W = 800;
  const GAME_H = 600;
  
  const [targets, setTargets] = useState<Target[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const sessionStartTimeRef = useRef(0);
  const errorsRef = useRef(0);
  const reactionTimesRef = useRef<number[]>([]);
  const fingertipPositionsRef = useRef<{x: number; y: number; timestamp: number}[]>([]);
  const targetShownTimeRef = useRef(0);
  const hitTargetsRef = useRef(0);

  const targetCount = config?.targetCount || 5;
  const targetSize = config?.targetSize || 45;

  const realTracking = useHandTracking({ enabled: !demoMode, gameWidth: GAME_W, gameHeight: GAME_H });
  const demoTracking = useDemoMode(demoMode, GAME_W, GAME_H);
  const tracking = demoMode ? demoTracking : realTracking;

  useEffect(() => {
    const newTargets: Target[] = [];
    const positions: {x: number; y: number}[] = [];
    
    for (let i = 0; i < targetCount; i++) {
      let pos: { x: number; y: number };
      let attempts = 0;
      do {
        pos = generateRandomTarget(GAME_W, GAME_H, targetSize + 20);
        attempts++;
      } while (attempts < 50 && positions.some(p => distance(p, pos) < targetSize * 2.5));
      positions.push(pos);
      
      newTargets.push({
        id: i,
        x: pos.x,
        y: pos.y,
        radius: targetSize,
        active: i === 0,
        hit: false,
        order: i + 1,
      });
    }
    setTargets(newTargets);
  }, [targetCount, targetSize]);

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
      hits: hitTargetsRef.current,
      misses: 0,
      errors: errorsRef.current,
      accuracy: targetCount > 0 ? ((targetCount - errorsRef.current) / targetCount) * 100 : 0,
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
      activity: 'sequence-challenge',
      difficulty,
      score: scoreBreakdown.overall,
      accuracy: scoreBreakdown.accuracy,
      completionTime: totalTime,
      reactionTime: avgReaction,
      errors: errorsRef.current,
      movementSmoothness: metrics.movementSmoothness,
      pathDeviation: 0,
      targetsCompleted: hitTargetsRef.current,
      totalTargets: targetCount,
      completionPercentage: 100,
      movementDistance: metrics.movementDistance,
    });
  }, [difficulty, targetCount]);

  useEffect(() => {
    if (!gameStarted || gameComplete) return;
    
    const interval = setInterval(() => {
      const pos = tracking.getCurrentPosition();
      if (!pos.detected) return;
      
      fingertipPositionsRef.current.push({ x: pos.x, y: pos.y, timestamp: Date.now() });
      
      setTargets(prev => {
        const updated = [...prev];
        const currentTarget = updated[activeIdx];
        
        if (!currentTarget || currentTarget.hit) return prev;
        
        const dist = distance(pos, { x: currentTarget.x, y: currentTarget.y });
        
        if (dist <= currentTarget.radius + 15) {
          const reactionTime = (Date.now() - targetShownTimeRef.current) / 1000;
          reactionTimesRef.current.push(reactionTime);
          hitTargetsRef.current++;
          
          updated[activeIdx] = { ...currentTarget, hit: true };
          
          setFeedback('correct');
          setTimeout(() => setFeedback(null), 500);
          
          const nextIdx = activeIdx + 1;
          if (nextIdx < targetCount) {
            setActiveIdx(nextIdx);
            updated[nextIdx] = { ...updated[nextIdx], active: true };
            setCompletedCount(nextIdx);
            targetShownTimeRef.current = Date.now();
          } else {
            setCompletedCount(targetCount);
            setGameComplete(true);
            saveResults();
          }
        } else {
          for (let i = 0; i < updated.length; i++) {
            if (i !== activeIdx && !updated[i].hit) {
              const d = distance(pos, { x: updated[i].x, y: updated[i].y });
              if (d <= updated[i].radius + 15) {
                errorsRef.current++;
                setFeedback('wrong');
                setTimeout(() => setFeedback(null), 500);
                break;
              }
            }
          }
        }
        
        return updated;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete, activeIdx, targetCount, tracking, saveResults]);

  const renderGame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, _pos: HandPosition) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    
    targets.forEach((target, i) => {
      if (target.hit) return;
      
      const isActive = i === activeIdx;
      
      if (isActive) {
        const gradient = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, target.radius + 15);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = isActive ? '#4f46e5' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${target.radius * 0.7}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(target.order), target.x, target.y);
    });
    
    if (feedback === 'wrong') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fillRect(0, 0, w, h);
    }
  }, [targets, activeIdx, feedback]);

  if (gameComplete) {
    navigate(`/results/sequence-challenge?difficulty=${difficulty}&demo=${demoMode}`);
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
        <h2 className="font-semibold text-text-primary">Sequence Challenge</h2>
        <div className="text-sm text-text-secondary">
          Next: {Math.min(activeIdx + 1, targetCount)} / {targetCount}
        </div>
      </div>
      
      <div className="px-4 py-2 bg-white border-b border-border">
        <ProgressBar current={completedCount} total={targetCount} />
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
          
          {feedback === 'correct' && (
            <div className="mt-3 text-center text-success font-medium animate-pulse">
              ✓ Correct!
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="mt-3 text-center text-warning font-medium animate-pulse">
              Try the next number!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
