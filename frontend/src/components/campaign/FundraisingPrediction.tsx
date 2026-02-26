import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, Calendar, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getFundraisingPrediction, type PredictionData } from '../../services/prediction.service';

interface Props {
  campaignId: string;
}

const FundraisingPrediction = ({ campaignId }: Props) => {
  const [data, setData] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFundraisingPrediction(campaignId)
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [campaignId]);

  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.historicalData.length === 0) return null;

  const target = parseFloat(data.targetAmount);
  const chartData = [
    ...data.historicalData.map((d) => ({ ...d, type: 'actual' as const, predicted: undefined as number | undefined })),
    ...data.predictedData.map((d) => ({ ...d, type: 'predicted' as const, amount: undefined as number | undefined, predicted: d.amount })),
  ];

  // Bridge: last historical point also gets predicted value for continuity
  if (data.historicalData.length > 0 && data.predictedData.length > 0) {
    const lastHistorical = chartData.find(
      (d) => d.day === data.historicalData[data.historicalData.length - 1].day && d.type === 'actual'
    );
    if (lastHistorical) {
      lastHistorical.predicted = lastHistorical.amount;
    }
  }

  const confidenceColors: Record<string, { text: string; bg: string }> = {
    high: { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    medium: { text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    low: { text: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  };

  const conf = confidenceColors[data.confidence] || confidenceColors.low;

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Fundraising Prediction
          <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${conf.bg} ${conf.text}`}>
            {data.confidence.toUpperCase()} confidence
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Zap className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              NPR {data.averageDailyRate.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Avg. Daily Rate</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900 dark:text-white">{data.daysActive}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Days Active</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Target className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data.predictedCompletionDays !== null ? `${data.predictedCompletionDays}d` : '—'}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Est. Completion</p>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              label={{ value: 'Days', position: 'insideBottom', offset: -5, fontSize: 11 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`}
              domain={[0, target]}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `NPR ${value?.toLocaleString() || 0}`,
                name === 'amount' ? 'Actual' : 'Predicted',
              ]}
              labelFormatter={(label) => `Day ${label}`}
            />
            <ReferenceLine
              y={target}
              stroke="#dc2626"
              strokeDasharray="5 5"
              label={{ value: 'Target', position: 'right', fontSize: 11, fill: '#dc2626' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#059669"
              strokeWidth={2.5}
              fill="url(#actualGrad)"
              connectNulls={false}
              dot={{ fill: '#059669', r: 2 }}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#predictedGrad)"
              connectNulls={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-600 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-blue-500 rounded" style={{ borderTop: '2px dashed #3b82f6' }} />
            <span className="text-gray-600 dark:text-gray-400">Predicted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-red-500 rounded" style={{ borderTop: '2px dashed #dc2626' }} />
            <span className="text-gray-600 dark:text-gray-400">Target</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundraisingPrediction;
