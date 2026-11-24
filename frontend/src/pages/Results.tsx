import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Clock, Target, Zap, AlertCircle, Repeat, BarChart3, Activity } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScoreCard } from '../components/ScoreCard';
import { MetricCard } from '../components/MetricCard';
import { storageService } from '../services/storageService';
import { calculateScore } from '../services/scoringService';
import type { SessionRecord } from '../types/session';
import type { Difficulty } from '../types/game';

const ACTIVITY_NAMES: Record<string, string> = {
  'target-touch': 'Target Touch',
  'follow-path': 'Follow the Path',
  'sequence-challenge': 'Sequence Challenge',
  'moving-targets': 'Moving Targets',
};

export function Results() {
  const { activityType } = useParams<{ activityType: string }>();
  const [searchParams] = useSearchParams();
  
  const difficulty = (searchParams.get('difficulty') || 'easy') as Difficulty;
  const isDemo = searchParams.get('demo') === 'true';
  
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);

  useEffect(() => {
    const sessions = storageService.getSessions();
    const latest = sessions
      .filter(s => s.activity === activityType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (latest) {
      setSession(latest);
      
      const metrics = {
        totalTime: latest.completionTime,
        reactionTimes: [],
        averageReactionTime: latest.reactionTime,
        hits: latest.targetsCompleted,
        misses: 0,
        errors: latest.errors,
        accuracy: latest.accuracy,
        movementDistance: latest.movementDistance,
        movementSmoothness: latest.movementSmoothness,
        pathDeviation: latest.pathDeviation,
        completionPercentage: latest.completionPercentage,
        score: latest.score,
        fingertipPositions: [],
      };
      
      setScoreBreakdown(calculateScore(metrics, latest.totalTargets));
    }
  }, [activityType]);

  if (!session || !scoreBreakdown) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-secondary">Loading results...</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Accuracy', value: scoreBreakdown.accuracy, color: '#4f46e5' },
    { name: 'Speed', value: scoreBreakdown.speed, color: '#06b6d4' },
    { name: 'Control', value: scoreBreakdown.control, color: '#10b981' },
    { name: 'Errors', value: scoreBreakdown.errors, color: '#f59e0b' },
    { name: 'Completion', value: scoreBreakdown.completion, color: '#8b5cf6' },
  ];

  return (
    <div className="flex-1 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Demo notice */}
        {isDemo && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mb-6 text-center text-sm font-medium text-warning">
            ⚠️ Demo Data — This is simulated data for demonstration purposes
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Great Job!</h1>
          <p className="text-text-secondary text-lg">
            {ACTIVITY_NAMES[activityType || '']} — {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </p>
        </div>

        {/* Score */}
        <div className="mb-8">
          <ScoreCard score={scoreBreakdown.overall} message={scoreBreakdown.message} />
        </div>

        {/* Adaptive difficulty */}
        {session.score >= 85 && (
          <Card className="mb-6 bg-success/5 border-success/20 text-center">
            <p className="text-success font-semibold">🌟 You're ready for the next level!</p>
            <p className="text-sm text-text-secondary mt-1">Try a harder difficulty to keep improving.</p>
          </Card>
        )}
        {session.score < 60 && (
          <Card className="mb-6 bg-primary/5 border-primary/20 text-center">
            <p className="text-primary font-semibold">💪 Keep practicing!</p>
            <p className="text-sm text-text-secondary mt-1">Another round at this level will help build confidence.</p>
          </Card>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            icon={Target}
            label="Accuracy"
            value={`${scoreBreakdown.accuracy}%`}
            color="primary"
          />
          <MetricCard
            icon={Clock}
            label="Time"
            value={session.completionTime.toFixed(1)}
            suffix="sec"
            color="accent"
          />
          <MetricCard
            icon={Zap}
            label="Reaction"
            value={session.reactionTime.toFixed(2)}
            suffix="sec"
            color="success"
          />
          <MetricCard
            icon={AlertCircle}
            label="Errors"
            value={session.errors}
            color={session.errors > 3 ? 'danger' : 'warning'}
          />
          <MetricCard
            icon={Trophy}
            label="Targets"
            value={`${session.targetsCompleted}/${session.totalTargets}`}
            color="primary"
          />
          <MetricCard
            icon={Activity}
            label="Smoothness"
            value={`${Math.round(session.movementSmoothness)}%`}
            color="success"
          />
        </div>

        {/* Score Breakdown Chart */}
        <Card className="mb-8">
          <h3 className="text-lg font-bold text-text-primary mb-4">Score Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/setup/${activityType}?difficulty=${difficulty}&demo=${isDemo}`}>
            <Button size="lg" className="w-full sm:w-auto">
              <Repeat className="w-5 h-5" />
              Try Again
            </Button>
          </Link>
          <Link to="/activities">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Choose Another Activity
            </Button>
          </Link>
          <Link to="/progress">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              <BarChart3 className="w-5 h-5" />
              View Progress
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
