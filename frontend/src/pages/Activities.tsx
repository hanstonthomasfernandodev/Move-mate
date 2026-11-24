import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Zap, Clock, Target } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ACTIVITIES } from '../data/activities';
import type { ActivityType, Difficulty } from '../types/game';

export function Activities() {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const handleStart = (type: ActivityType, difficulty: Difficulty) => {
    navigate(`/setup/${type}?difficulty=${difficulty}&demo=${demoMode}`);
  };

  const skillIcons: Record<string, React.ReactNode> = {
    'Hand-eye coordination': <Target className="w-3.5 h-3.5" />,
    'Accuracy': <Target className="w-3.5 h-3.5" />,
    'Reaction time': <Zap className="w-3.5 h-3.5" />,
    'Movement control': <Clock className="w-3.5 h-3.5" />,
    'Smoothness': <Clock className="w-3.5 h-3.5" />,
    'Motor planning': <Target className="w-3.5 h-3.5" />,
    'Sequential movement': <Target className="w-3.5 h-3.5" />,
    'Memory': <Target className="w-3.5 h-3.5" />,
  };

  return (
    <div className="flex-1 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">Choose an Activity</h1>
          <p className="text-text-secondary text-lg">
            Select an activity and difficulty to begin training
          </p>
          
          <div className="mt-6 inline-flex items-center gap-3 bg-warning/10 border border-warning/20 rounded-full px-4 py-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-warning"></div>
            </label>
            <span className="text-sm font-medium text-text-primary">
              Demo Mode {demoMode && '(No Camera Required)'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {ACTIVITIES.map(activity => (
            <Card key={activity.type} hover padding="none">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{activity.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">{activity.name}</h3>
                    <p className="text-text-secondary text-sm mt-1">{activity.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-5">
                  {activity.skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 bg-surface-darker text-text-secondary text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {skillIcons[skill] || <Target className="w-3 h-3" />}
                      {skill}
                    </span>
                  ))}
                </div>
                
                {selectedActivity === activity.type ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-text-primary">Select difficulty:</p>
                    <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
                        <Button
                          key={diff}
                          variant={diff === 'easy' ? 'primary' : diff === 'medium' ? 'secondary' : 'danger'}
                          size="sm"
                          onClick={() => handleStart(activity.type, diff)}
                          className="flex-1"
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedActivity(null)}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => setSelectedActivity(activity.type)}
                  >
                    <Play className="w-4 h-4" />
                    Select Activity
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
