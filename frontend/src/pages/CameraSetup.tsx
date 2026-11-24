import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Camera, Hand, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CameraPreview } from '../components/CameraPreview';
import { useHandTracking } from '../hooks/useHandTracking';
import { useDemoMode } from '../hooks/useDemoMode';
import { ACTIVITY_MAP } from '../data/activities';

export function CameraSetup() {
  const { activityType } = useParams<{ activityType: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const difficulty = searchParams.get('difficulty') || 'easy';
  const isDemo = searchParams.get('demo') === 'true';
  
  const [step, setStep] = useState<'preview' | 'detecting' | 'ready'>('preview');
  const [gameWidth] = useState(800);
  const [gameHeight] = useState(600);

  const realTracking = useHandTracking({
    enabled: !isDemo && step !== 'preview',
    gameWidth,
    gameHeight,
  });

  const demoTracking = useDemoMode(isDemo && step !== 'preview', gameWidth, gameHeight);

  const tracking = isDemo ? demoTracking : realTracking;

  const handleStartCamera = useCallback(() => {
    setStep('detecting');
  }, []);

  useEffect(() => {
    if (step === 'detecting' && tracking.handDetected && !tracking.loading) {
      const timer = setTimeout(() => setStep('ready'), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, tracking.handDetected, tracking.loading]);

  const handleStartActivity = () => {
    if (!activityType) return;
    tracking.cleanup();
    navigate(`/play/${activityType}?difficulty=${difficulty}&demo=${isDemo}`);
  };

  const activity = ACTIVITY_MAP[activityType || ''];

  return (
    <div className="flex-1 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Let's Get Ready</h1>
          <p className="text-text-secondary">
            {activity?.name} — {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </p>
        </div>

        {step === 'preview' && (
          <Card padding="lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">Setup Instructions</h2>
            <ol className="space-y-3 mb-6">
              {[
                'Sit comfortably in front of your laptop.',
                'Keep your hand visible to the camera.',
                'Keep your hand approximately 40–80 cm from the camera.',
                'Make sure the room has enough light.',
                'Keep the background reasonably clear.',
              ].map((instruction, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm">{instruction}</span>
                </li>
              ))}
            </ol>
            
            <CameraPreview active={false} handDetected={false} />
            
            <div className="mt-6 text-center">
              <Button onClick={handleStartCamera} size="lg">
                <Camera className="w-5 h-5" />
                {isDemo ? 'Start Demo' : 'Enable Camera'}
              </Button>
            </div>
          </Card>
        )}

        {step === 'detecting' && (
          <Card padding="lg">
            <CameraPreview active={true} handDetected={tracking.handDetected} stream={'stream' in tracking ? tracking.stream : undefined} />
            
            <div className="mt-6 text-center">
              {tracking.loading ? (
                <div className="flex items-center justify-center gap-2 text-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing movement tracking...</span>
                </div>
              ) : tracking.error ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-danger">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{tracking.error}</span>
                  </div>
                  <Button onClick={handleStartCamera} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : tracking.handDetected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-success font-medium">
                    <Hand className="w-5 h-5" />
                    <span>Hand detected ✓</span>
                  </div>
                </div>
              ) : (
                <p className="text-text-secondary text-sm">
                  ✋ Move your hand into the camera view
                </p>
              )}
            </div>
          </Card>
        )}

        {step === 'ready' && (
          <Card padding="lg" className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">You're Ready!</h2>
            <p className="text-text-secondary mb-6">Hand tracking is working. Let's begin!</p>
            
            <Button onClick={handleStartActivity} size="lg">
              <ArrowRight className="w-5 h-5" />
              Start Activity
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
