interface ScoreCardProps {
  score: number;
  message: string;
  showLabel?: boolean;
}

export function ScoreCard({ score, message, showLabel = true }: ScoreCardProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    return 'text-warning';
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-primary/10 border-primary/20';
    return 'bg-warning/10 border-warning/20';
  };

  return (
    <div className={`rounded-2xl border-2 p-8 text-center ${getBgColor(score)}`}>
      {showLabel && (
        <p className="text-sm font-medium text-text-secondary mb-2">Overall Score</p>
      )}
      <div className={`text-6xl font-bold mb-3 ${getColor(score)}`}>
        {score}
      </div>
      <p className="text-lg font-medium text-text-primary">{message}</p>
      <p className="text-sm text-text-secondary mt-1">out of 100</p>
    </div>
  );
}
