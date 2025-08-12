import React from "react";

type Props = { score: number };

const ScoreGauge: React.FC<Props> = ({ score }) => {
  const size = 160;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const dash = (progress / 100) * circumference;

  const tier = score >= 80 ? "text-success" : score >= 65 ? "text-warning" : "text-danger";

  return (
    <div className="relative" role="img" aria-label={`Match score ${score}%`}>
      <svg width={size} height={size} className="block">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))"/>
            <stop offset="100%" stopColor="hsl(var(--primary))"/>
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="text-muted/40"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className={`${tier} drop-shadow`}
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-heading font-semibold">{score}%</div>
          <div className="text-xs text-muted-foreground">Match</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
