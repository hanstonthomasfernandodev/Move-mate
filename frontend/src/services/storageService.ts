import type { SessionRecord, ProgressData } from '../types/session';
import type { ActivityType, Difficulty } from '../types/game';

const STORAGE_KEY = 'movemate_sessions';
const ONBOARDING_KEY = 'movemate_onboarded';

export const storageService = {
  saveSession(session: SessionRecord): void {
    const sessions = this.getSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  getSessions(): SessionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getSessionById(id: string): SessionRecord | undefined {
    return this.getSessions().find(s => s.id === id);
  },

  deleteSession(id: string): void {
    const sessions = this.getSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  clearAllSessions(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  isOnboarded(): boolean {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  },

  setOnboarded(): void {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  },

  getProgressData(filter?: ActivityType): ProgressData {
    let sessions = this.getSessions();
    if (filter) {
      sessions = sessions.filter(s => s.activity === filter);
    }

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        bestScore: 0,
        averageAccuracy: 0,
        totalActivitiesCompleted: 0,
        sessionsByActivity: {
          'target-touch': 0,
          'follow-path': 0,
          'sequence-challenge': 0,
          'moving-targets': 0,
        },
      };
    }

    const scores = sessions.map(s => s.score);
    const accuracies = sessions.map(s => s.accuracy);

    const sessionsByActivity: Record<ActivityType, number> = {
      'target-touch': 0,
      'follow-path': 0,
      'sequence-challenge': 0,
      'moving-targets': 0,
    };
    sessions.forEach(s => {
      sessionsByActivity[s.activity]++;
    });

    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const avgReaction = sessions.reduce((a, s) => a + s.reactionTime, 0) / sessions.length;
    const avgSmoothness = sessions.reduce((a, s) => a + s.movementSmoothness, 0) / sessions.length;
    
    const areas = [
      { name: 'accuracy', value: avgAccuracy },
      { name: 'reaction time', value: 100 - avgReaction * 10 },
      { name: 'movement control', value: avgSmoothness },
    ];
    areas.sort((a, b) => b.value - a.value);

    const recentSessions = sessions.slice(-3);
    const recentAvgScore = recentSessions.reduce((a, s) => a + s.score, 0) / recentSessions.length;
    
    let recommendedDifficulty: Difficulty = 'easy';
    if (recentAvgScore >= 85) recommendedDifficulty = 'hard';
    else if (recentAvgScore >= 60) recommendedDifficulty = 'medium';
    else recommendedDifficulty = 'easy';

    return {
      totalSessions: sessions.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      bestScore: Math.max(...scores),
      averageAccuracy: Math.round(avgAccuracy),
      totalActivitiesCompleted: sessions.length,
      sessionsByActivity,
      strongestArea: areas[0]?.name,
      improvementArea: areas[areas.length - 1]?.name,
      recommendedDifficulty,
    };
  },
};
