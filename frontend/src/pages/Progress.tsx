import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { TrendingUp, Trophy, Target, Activity, BarChart3, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { storageService } from '../services/storageService';
import type { ActivityType } from '../types/game';
import { formatDate } from '../utils/helpers';

const ACTIVITY_FILTERS: { value: ActivityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Activities' },
  { value: 'target-touch', label: 'Target Touch' },
  { value: 'follow-path', label: 'Follow the Path' },
  { value: 'sequence-challenge', label: 'Sequence Challenge' },
  { value: 'moving-targets', label: 'Moving Targets' },
];

const ACTIVITY_NAMES: Record<string, string> = {
  'target-touch': 'Target Touch',
  'follow-path': 'Follow Path',
  'sequence-challenge': 'Sequence',
  'moving-targets': 'Moving',
};

export function Progress() {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [showClearModal, setShowClearModal] = useState(false);

  const allSessions = storageService.getSessions();
  const progress = storageService.getProgressData(filter === 'all' ? undefined : filter);
  
  const sessions = useMemo(() => {
    let filtered = allSessions;
    if (filter !== 'all') {
      filtered = filtered.filter(s => s.activity === filter);
    }
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allSessions, filter]);

  const scoreData = sessions.map((s, i) => ({
    index: i + 1,
    date: formatDate(s.date),
    score: s.score,
    activity: ACTIVITY_NAMES[s.activity] || s.activity,
  }));

  const accuracyData = sessions.map((s, i) => ({
    index: i + 1,
    date: formatDate(s.date),
    accuracy: s.accuracy,
  }));

  const activityPerf = Object.entries(progress.sessionsByActivity)
    .filter(([_, count]) => count > 0)
    .map(([activity, count]) => ({
      name: ACTIVITY_NAMES[activity] || activity,
      sessions: count,
    }));

  const handleClearData = () => {
    storageService.clearAllSessions();
    setShowClearModal(false);
    window.location.reload();
  };

  const getRecommendation = () => {
    if (allSessions.length === 0) return null;
    
    if (progress.strongestArea && progress.improvementArea) {
      if (progress.strongestArea === 'accuracy') {
        return `Your strongest area is accuracy. Try Follow the Path to practice movement control.`;
      }
      if (progress.strongestArea === 'movement control') {
        return `Your movement control is great! Try Target Touch to improve reaction time.`;
      }
      return `Your reaction time is solid. Try Sequence Challenge for motor planning.`;
    }
    
    const recent = allSessions.slice(-5);
    const avgScore = recent.reduce((a, s) => a + s.score, 0) / recent.length;
    
    if (avgScore >= 80) {
      return `Great progress! Consider trying a harder difficulty level.`;
    }
    return `Keep practicing! Regular sessions help build coordination skills.`;
  };

  const recommendation = getRecommendation();

  if (allSessions.length === 0) {
    return (
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-6 text-center">Progress Dashboard</h1>
          
          <Card className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">No Sessions Yet</h2>
            <p className="text-text-secondary mb-6">
              Complete your first activity to start tracking progress!
            </p>
            <Link to="/activities">
              <Button>Start Training</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Progress Dashboard</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearModal(true)}
            className="text-danger hover:text-danger"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </Button>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ACTIVITY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-white border border-border text-text-secondary hover:bg-surface-darker'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={Activity}
            label="Total Sessions"
            value={progress.totalSessions}
            color="primary"
          />
          <MetricCard
            icon={TrendingUp}
            label="Average Score"
            value={progress.averageScore}
            suffix="/100"
            color="accent"
          />
          <MetricCard
            icon={Trophy}
            label="Best Score"
            value={progress.bestScore}
            suffix="/100"
            color="success"
          />
          <MetricCard
            icon={Target}
            label="Avg Accuracy"
            value={`${progress.averageAccuracy}%`}
            color="primary"
          />
        </div>

        {/* Recommendation */}
        {recommendation && (
          <Card className="mb-8 bg-primary/5 border-primary/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">Personalized Recommendation</p>
                <p className="text-text-secondary text-sm mt-1">{recommendation}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Score Over Time */}
          <Card>
            <h3 className="text-lg font-bold text-text-primary mb-4">Score Over Time</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="index" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ fill: '#4f46e5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Accuracy Over Time */}
          <Card>
            <h3 className="text-lg font-bold text-text-primary mb-4">Accuracy Over Time</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="index" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Activity Performance */}
        {activityPerf.length > 0 && (
          <Card className="mb-8">
            <h3 className="text-lg font-bold text-text-primary mb-4">Activity Performance</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="sessions" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Recent Sessions */}
        <Card>
          <h3 className="text-lg font-bold text-text-primary mb-4">Recent Sessions</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.slice().reverse().slice(0, 10).map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-surface-darker rounded-lg"
              >
                <div>
                  <p className="font-medium text-text-primary text-sm">
                    {ACTIVITY_NAMES[session.activity] || session.activity}
                    <span className="text-text-secondary ml-2 text-xs capitalize">
                      ({session.difficulty})
                    </span>
                  </p>
                  <p className="text-xs text-text-secondary">{formatDate(session.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{session.score}/100</p>
                  <p className="text-xs text-text-secondary">{session.accuracy}% accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Clear Data Modal */}
        <Modal
          open={showClearModal}
          onClose={() => setShowClearModal(false)}
          title="Clear All Data"
        >
          <p className="text-text-secondary mb-6">
            This will permanently delete all your session history and progress data. 
            This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearData}>
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
