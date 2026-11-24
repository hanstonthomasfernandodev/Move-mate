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
import { generateId, generatePath, distance, calculateSmoothness, totalDistance } from '../utils/helpers';
import type { PathPoint, GameMetrics, Difficulty } from '../types/game';
import type { HandPosition } from '../hooks/useHandTracking';
import { ArrowLeft } from 'lucide-react';

interface Props {
  difficulty: Difficulty;
  demoMode: boolean;
}

export function FollowPath({ difficulty, demoMode }: Props) {
  const navigate = useNavigate();
  const activity = ACTIVITY_MAP['follow-path'];
  const config = activity?.difficulties[difficulty];
  
  const GAME_W = 800;
  const GAME_H = 600;
  
  const [path, setPath] = useState<PathPoint[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [onPath, setOnPath] = useState(true);
  
  const sessionStartTimeRef = useRef(0);
  const fingertipPositionsRef = useRef<{x: number; y: number; timestamp: number}[]>([]);
  const deviationsRef = useRef<number[]>([]);
  const pathExitsRef = useRef(0);
  const nearestPathIdxRef = useRef(0);
  const tolerance = config?.tolerance || 30;

  const realTracking = useHandTracking({ enabled: !demoMode, gameWidth: GAME_W, gameHeight: GAME_H });
  const demoTracking = useDemoMode(demoMode, GAME_W, GAME_H);
  const tracking = demoMode ? demoTracking : realTracking;

  useEffect(() => {
    setPath(generatePath(GAME_W, GAME_H, 25));
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setGameStarted(true);
    sessionStartTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!gameStarted || gameComplete || path.length === 0) return;
    
    const interval = setInterval(() => {
      const pos = tracking.getCurrentPosition();
      if (!pos.detected) return;
      
      fingertipPositionsRef.current.push({ x: pos.x, y: pos.y, timestamp: Date.now() });
      
      let minDist = Infinity;
      let nearestIdx = 0;
      for (let i = 0; i < path.length; i++) {
        const d = distance(pos, path[i]);
        if (d < minDist) {
          minDist = d;
          nearestIdx = i;
        }
      }
      
      deviationsRef.current.push(minDist);
      
      const isOnPath = minDist <= tolerance;
      setOnPath(isOnPath);
      
      if (!isOnPath) {
        pathExitsRef.current++;
      }
      
      if (nearestIdx > nearestPathIdxRef.current) {
        nearestPathIdxRef.current = nearestIdx;
      }
      
      const newProgress = Math.round((nearestPathIdxRef.current / (path.length - 1)) * 100);
      setProgressPercent(newProgress);
      
      if (newProgress >= 100) {
        setGameComplete(true);
        
        const totalTime = (Date.now() - sessionStartTimeRef.current) / 1000;
        const avgDeviation = deviationsRef.current.length > 0
          ? deviationsRef.current.reduce((a, b) => a + b, 0) / deviationsRef.current.length
          : 0;
        
        const metrics: GameMetrics = {
          totalTime,
          reactionTimes: [],
          averageReactionTime: 0,
          hits: 1,
          misses: 0,
          errors: pathExitsRef.current,
          accuracy: Math.max(0, 100 - avgDeviation),
          movementDistance: totalDistance(fingertipPositionsRef.current as any),
          movementSmoothness: calculateSmoothness(fingertipPositionsRef.current as any),
          pathDeviation: avgDeviation,
          completionPercentage: 100,
          score: 0,
          fingertipPositions: fingertipPositionsRef.current as any,
        };
        
        const scoreBreakdown = calculateScore(metrics, 1);
        metrics.score = scoreBreakdown.overall;
        
        storageService.saveSession({
          id: generateId(),
          date: new Date().toISOString(),
          activity: 'follow-path',
          difficulty,
          score: scoreBreakdown.overall,
          accuracy: scoreBreakdown.accuracy,
          completionTime: totalTime,
          reactionTime: 0,
          errors: pathExitsRef.current,
          movementSmoothness: metrics.movementSmoothness,
          pathDeviation: avgDeviation,
          targetsCompleted: 1,
          totalTargets: 1,
          completionPercentage: 100,
          movementDistance: metrics.movementDistance,
        });
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete, path, tolerance, difficulty, tracking]);

  const renderGame = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, _pos: HandPosition) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    
    if (path.length < 2) return;
    
    ctx.strokeStyle = onPath ? 'rgba(79, 70, 229, 0.08)' : 'rgba(239, 68, 68, 0.08)';
    ctx.lineWidth = tolerance * 2 + 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    const progressIdx = Math.floor((progressPercent / 100) * (path.length - 1));
    if (progressIdx > 0) {
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i <= progressIdx; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
    
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(path[0].x, path[0].y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', path[0].x, path[0].y);
    
    const end = path[path.length - 1];
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('F', end.x, end.y);
  }, [path, progressPercent, onPath, tolerance]);

  if (gameComplete) {
    navigate(`/results/follow-path?difficulty=${difficulty}&demo=${demoMode}`);
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
        <h2 className="font-semibold text-text-primary">Follow the Path</h2>
        <div className="text-sm text-text-secondary">{progressPercent}%</div>
      </div>
      
      <div className="px-4 py-2 bg-white border-b border-border">
        <ProgressBar current={progressPercent} total={100} label="Path Progress" />
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
          
          {!onPath && gameStarted && (
            <div className="mt-3 text-center text-warning text-sm font-medium">
              ⚠️ Try to stay on the path
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
