export type ActivityType = 'target-touch' | 'follow-path' | 'sequence-challenge' | 'moving-targets';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Point {
  x: number;
  y: number;
  timestamp: number;
}

export interface Target {
  id: number;
  x: number;
  y: number;
  radius: number;
  active: boolean;
  hit: boolean;
  hitTime?: number;
  order?: number;
}

export interface MovingTarget extends Target {
  vx: number;
  vy: number;
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface GameMetrics {
  totalTime: number;
  reactionTimes: number[];
  averageReactionTime: number;
  hits: number;
  misses: number;
  errors: number;
  accuracy: number;
  movementDistance: number;
  movementSmoothness: number;
  pathDeviation: number;
  completionPercentage: number;
  score: number;
  fingertipPositions: Point[];
}

export interface CalibrationData {
  cameraWidth: number;
  cameraHeight: number;
  gameWidth: number;
  gameHeight: number;
  scaleX: number;
  scaleY: number;
}

export interface ActivityConfig {
  type: ActivityType;
  name: string;
  description: string;
  skills: string[];
  icon: string;
  difficulties: {
    easy: DifficultyConfig;
    medium: DifficultyConfig;
    hard: DifficultyConfig;
  };
}

export interface DifficultyConfig {
  label: string;
  targetCount: number;
  targetSize: number;
  speed: number;
  tolerance: number;
}
