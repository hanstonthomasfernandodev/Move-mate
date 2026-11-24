import { useParams, useSearchParams } from 'react-router-dom';
import { TargetTouch } from '../activities/TargetTouch';
import { FollowPath } from '../activities/FollowPath';
import { SequenceChallenge } from '../activities/SequenceChallenge';
import { MovingTargets } from '../activities/MovingTargets';

const ACTIVITY_COMPONENTS: Record<string, React.FC<any>> = {
  'target-touch': TargetTouch,
  'follow-path': FollowPath,
  'sequence-challenge': SequenceChallenge,
  'moving-targets': MovingTargets,
};

export function GameScreen() {
  const { activityType } = useParams<{ activityType: string }>();
  const [searchParams] = useSearchParams();
  
  const difficulty = (searchParams.get('difficulty') || 'easy') as 'easy' | 'medium' | 'hard';
  const isDemo = searchParams.get('demo') === 'true';
  
  const ActivityComponent = ACTIVITY_COMPONENTS[activityType || ''];
  
  if (!ActivityComponent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-secondary">Activity not found</p>
      </div>
    );
  }
  
  return <ActivityComponent difficulty={difficulty} demoMode={isDemo} />;
}
