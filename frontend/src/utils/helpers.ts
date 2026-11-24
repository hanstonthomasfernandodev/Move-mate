import type { Point, PathPoint } from '../types/game';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function totalDistance(points: Point[]): number {
  let dist = 0;
  for (let i = 1; i < points.length; i++) {
    dist += distance(points[i - 1], points[i]);
  }
  return dist;
}

export function smoothPositions(positions: Point[], windowSize: number = 3): Point[] {
  if (positions.length < windowSize) return positions;
  
  return positions.map((pos, i) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(positions.length, i + Math.ceil(windowSize / 2));
    const window = positions.slice(start, end);
    const avgX = window.reduce((sum, p) => sum + p.x, 0) / window.length;
    const avgY = window.reduce((sum, p) => sum + p.y, 0) / window.length;
    return { x: avgX, y: avgY, timestamp: pos.timestamp };
  });
}

export function calculateSmoothness(positions: Point[]): number {
  if (positions.length < 3) return 100;
  
  const velocities: number[] = [];
  for (let i = 1; i < positions.length; i++) {
    const dt = (positions[i].timestamp - positions[i - 1].timestamp) / 1000;
    if (dt > 0) {
      const d = distance(positions[i], positions[i - 1]);
      velocities.push(d / dt);
    }
  }
  
  if (velocities.length < 2) return 100;
  
  const accelChanges: number[] = [];
  for (let i = 1; i < velocities.length; i++) {
    accelChanges.push(Math.abs(velocities[i] - velocities[i - 1]));
  }
  
  const avgAccel = accelChanges.reduce((a, b) => a + b, 0) / accelChanges.length;
  const maxAvgVelocity = Math.max(...velocities, 1);
  
  const smoothness = Math.max(0, Math.min(100, 100 - (avgAccel / maxAvgVelocity) * 50));
  return smoothness;
}

export function distanceToPath(point: { x: number; y: number }, path: PathPoint[]): number {
  if (path.length === 0) return Infinity;
  
  let minDist = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const d = pointToSegmentDistance(point, path[i], path[i + 1]);
    minDist = Math.min(minDist, d);
  }
  return minDist;
}

function pointToSegmentDistance(
  point: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  
  if (lenSq === 0) return distance(point, a);
  
  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  
  return distance(point, { x: projX, y: projY });
}

export function generateRandomTarget(
  areaWidth: number,
  areaHeight: number,
  radius: number,
  padding: number = 40
): { x: number; y: number } {
  const x = padding + radius + Math.random() * (areaWidth - 2 * (padding + radius));
  const y = padding + radius + Math.random() * (areaHeight - 2 * (padding + radius));
  return { x, y };
}

export function generatePath(
  width: number,
  height: number,
  segments: number = 20
): PathPoint[] {
  const points: PathPoint[] = [];
  const padding = 60;
  const usableWidth = width - 2 * padding;
  const usableHeight = height - 2 * padding;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = padding + t * usableWidth;
    const y = padding + usableHeight / 2 + 
      Math.sin(t * Math.PI * 2) * (usableHeight * 0.3) +
      Math.cos(t * Math.PI * 3) * (usableHeight * 0.15);
    points.push({ x, y: Math.max(padding, Math.min(height - padding, y)) });
  }
  
  return points;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
