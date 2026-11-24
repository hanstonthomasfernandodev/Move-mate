import type { ActivityType, Difficulty } from './game';

export interface SessionRecord {
  id: string;
  date: string;
  activity: ActivityType;
  difficulty: Difficulty;
  score: number;
  accuracy: number;
  completionTime: number;
  reactionTime: number;
  errors: number;
  movementSmoothness: number;
  pathDeviation: number;
  targetsCompleted: number;
  totalTargets: number;
  completionPercentage: number;
  movementDistance: number;
}

export interface ProgressData {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  averageAccuracy: number;
  totalActivitiesCompleted: number;
  sessionsByActivity: Record<ActivityType, number>;
  recommendedActivity?: string;
  recommendedDifficulty?: Difficulty;
  strongestArea?: string;
  improvementArea?: string;
}
