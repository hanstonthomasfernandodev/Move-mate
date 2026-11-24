import type { GameMetrics } from '../types/game';

export interface ScoreBreakdown {
  overall: number;
  accuracy: number;
  speed: number;
  control: number;
  errors: number;
  completion: number;
  message: string;
}

export function calculateScore(metrics: GameMetrics, totalTargets: number): ScoreBreakdown {
  const accuracy = Math.min(100, metrics.accuracy);

  const avgReaction = metrics.averageReactionTime;
  let speed = 100;
  if (avgReaction > 0) {
    speed = Math.max(0, Math.min(100, 100 - (avgReaction - 0.3) * 30));
  }

  const control = Math.min(100, Math.max(0, metrics.movementSmoothness));

  const maxErrors = totalTargets;
  const errorScore = Math.max(0, 100 - (metrics.errors / Math.max(1, maxErrors)) * 100);

  const completion = Math.min(100, metrics.completionPercentage);

  const overall = Math.round(
    accuracy * 0.35 +
    speed * 0.20 +
    control * 0.20 +
    errorScore * 0.10 +
    completion * 0.15
  );

  let message = '';
  if (overall >= 90) message = 'Excellent work! 🌟';
  else if (overall >= 80) message = 'Great job! 🎉';
  else if (overall >= 70) message = 'Nice control! 👍';
  else if (overall >= 60) message = "You're getting better! 💪";
  else message = 'Keep practicing! You\'re improving! 🌱';

  return {
    overall: Math.min(100, Math.max(0, overall)),
    accuracy: Math.round(accuracy),
    speed: Math.round(speed),
    control: Math.round(control),
    errors: Math.round(errorScore),
    completion: Math.round(completion),
    message,
  };
}
