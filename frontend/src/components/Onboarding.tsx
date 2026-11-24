import { useState } from 'react';
import { Hand, Camera, Target } from 'lucide-react';
import { Button } from './Button';
import { storageService } from '../services/storageService';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      icon: <Hand className="w-12 h-12 text-primary" />,
      title: 'Welcome to MoveMate',
      description: 'MoveMate uses your laptop camera to track your hand during interactive activities.',
    },
    {
      icon: <Camera className="w-12 h-12 text-primary" />,
      title: 'Allow Camera Access',
      description: 'We\'ll ask for camera permission to track your hand movements. Your video stays on your device.',
    },
    {
      icon: <Target className="w-12 h-12 text-primary" />,
      title: 'Start Training',
      description: 'Complete fun activities to practice hand-eye coordination and track your progress!',
    },
  ];

  const handleComplete = () => {
    storageService.setOnboarded();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          {steps[step].icon}
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          {steps[step].title}
        </h2>
        
        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
          {steps[step].description}
        </p>
        
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === step ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-3 justify-center">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete} size="lg">
              Let's Start
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
