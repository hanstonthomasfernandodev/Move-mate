import type { ActivityConfig, DifficultyConfig } from '../types/game';

const targetTouchEasy: DifficultyConfig = { label: 'Easy', targetCount: 10, targetSize: 60, speed: 0, tolerance: 30 };
const targetTouchMedium: DifficultyConfig = { label: 'Medium', targetCount: 15, targetSize: 45, speed: 0, tolerance: 25 };
const targetTouchHard: DifficultyConfig = { label: 'Hard', targetCount: 20, targetSize: 30, speed: 0, tolerance: 20 };

const followPathEasy: DifficultyConfig = { label: 'Easy', targetCount: 0, targetSize: 0, speed: 0, tolerance: 40 };
const followPathMedium: DifficultyConfig = { label: 'Medium', targetCount: 0, targetSize: 0, speed: 0, tolerance: 28 };
const followPathHard: DifficultyConfig = { label: 'Hard', targetCount: 0, targetSize: 0, speed: 0, tolerance: 18 };

const sequenceEasy: DifficultyConfig = { label: 'Easy', targetCount: 3, targetSize: 55, speed: 0, tolerance: 30 };
const sequenceMedium: DifficultyConfig = { label: 'Medium', targetCount: 5, targetSize: 45, speed: 0, tolerance: 25 };
const sequenceHard: DifficultyConfig = { label: 'Hard', targetCount: 8, targetSize: 35, speed: 0, tolerance: 20 };

const movingEasy: DifficultyConfig = { label: 'Easy', targetCount: 10, targetSize: 55, speed: 1, tolerance: 30 };
const movingMedium: DifficultyConfig = { label: 'Medium', targetCount: 15, targetSize: 45, speed: 2, tolerance: 25 };
const movingHard: DifficultyConfig = { label: 'Hard', targetCount: 20, targetSize: 35, speed: 3, tolerance: 20 };

export const ACTIVITIES: ActivityConfig[] = [
  {
    type: 'target-touch',
    name: 'Target Touch',
    description: 'Touch the targets as accurately as you can.',
    skills: ['Hand-eye coordination', 'Accuracy', 'Reaction time'],
    icon: '🎯',
    difficulties: {
      easy: targetTouchEasy,
      medium: targetTouchMedium,
      hard: targetTouchHard,
    },
  },
  {
    type: 'follow-path',
    name: 'Follow the Path',
    description: 'Move your fingertip along the path without leaving it.',
    skills: ['Movement control', 'Accuracy', 'Smoothness'],
    icon: '🛤️',
    difficulties: {
      easy: followPathEasy,
      medium: followPathMedium,
      hard: followPathHard,
    },
  },
  {
    type: 'sequence-challenge',
    name: 'Sequence Challenge',
    description: 'Touch the targets in the correct order.',
    skills: ['Motor planning', 'Sequential movement', 'Memory'],
    icon: '🔢',
    difficulties: {
      easy: sequenceEasy,
      medium: sequenceMedium,
      hard: sequenceHard,
    },
  },
  {
    type: 'moving-targets',
    name: 'Moving Targets',
    description: 'Reach the moving targets before they disappear.',
    skills: ['Hand-eye coordination', 'Reaction time', 'Movement control'],
    icon: '🏃',
    difficulties: {
      easy: movingEasy,
      medium: movingMedium,
      hard: movingHard,
    },
  },
];

export const ACTIVITY_MAP = Object.fromEntries(ACTIVITIES.map(a => [a.type, a])) as Record<string, ActivityConfig>;
