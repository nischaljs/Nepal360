interface AIPredictionBadgeProps {
  prediction: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  score: number;
  showDetails?: boolean;
}

const predictionConfig = {
  VERY_HIGH: { color: 'bg-green-500', label: 'Very High Success', icon: '🚀' },
  HIGH: { color: 'bg-green-400', label: 'High Success', icon: '📈' },
  MODERATE: { color: 'bg-yellow-500', label: 'Moderate Success', icon: '⚖️' },
  LOW: { color: 'bg-orange-500', label: 'Low Success', icon: '📉' },
  VERY_LOW: { color: 'bg-red-500', label: 'Very Low Success', icon: '⚠️' },
};

export default function AIPredictionBadge({
  prediction,
  score,
  showDetails = false,
}: AIPredictionBadgeProps) {
  const config = predictionConfig[prediction];

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
      <span className="text-lg">{config.icon}</span>
      <span className="text-sm font-medium text-gray-700">{config.label}</span>
      {showDetails && (
        <span className="text-xs text-gray-500">({score}%)</span>
      )}
    </div>
  );
}
