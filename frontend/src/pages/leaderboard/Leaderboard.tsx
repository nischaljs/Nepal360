import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listLeaderboards, getLeaderboard, type Leaderboard, type LeaderboardEntry } from "../../services/leaderboard.service";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Trophy, Medal, ArrowLeft, Loader2 } from "lucide-react";

const Leaderboard = () => {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [currentLeaderboard, setCurrentLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("MONTHLY");

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const data = await listLeaderboards();
        setLeaderboards(data);
        
        // Default to monthly current period
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const currentKey = `${year}-${month}`;
        
        const monthly = data.find(l => l.period === 'MONTHLY' && l.periodKey === currentKey);
        const target = monthly || data[0];
        if (target) {
          const full = await getLeaderboard(target.period, target.periodKey);
          setCurrentLeaderboard({
            id: full.id,
            period: full.period as any,
            periodKey: full.periodKey,
            createdAt: full.createdAt,
            entries: full.entries,
          });
          setSelectedPeriod(target.period);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const handlePeriodChange = async (period: string, key: string) => {
    setLoading(true);
    try {
      const data = await getLeaderboard(period, key);
      setCurrentLeaderboard({
        id: data.id,
        period: data.period as any,
        periodKey: data.periodKey,
        createdAt: data.createdAt,
        entries: data.entries
      });
      setSelectedPeriod(period);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPeriod = (period: string, key: string) => {
    if (period === 'MONTHLY') {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    if (period === 'YEARLY') {
      return key;
    }
    return key;
  };

  if (loading && !currentLeaderboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <Link to="/" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 mb-4">
            <ArrowLeft size={20} /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-2">Top donors making a difference in Nepal</p>
        </div>

        {/* Period Selector */}
        <div className="mb-8 flex flex-wrap gap-2">
          {leaderboards
            .filter((l, i, arr) => arr.findIndex(x => x.period === l.period) === i)
            .map(l => (
              <Button
                key={l.period}
                variant={selectedPeriod === l.period ? "default" : "outline"}
                className={selectedPeriod === l.period ? "bg-emerald-600" : ""}
                onClick={() => handlePeriodChange(l.period, l.periodKey)}
              >
                {l.period === 'MONTHLY' ? 'Monthly' : l.period === 'YEARLY' ? 'Yearly' : 'Campaign'}
              </Button>
            ))}
        </div>

        {/* Current Leaderboard */}
        {currentLeaderboard && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                {formatPeriod(currentLeaderboard.period, currentLeaderboard.periodKey)} Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentLeaderboard.entries.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-600">No rankings yet</h3>
                  <p className="text-gray-500">Be the first to contribute this period!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentLeaderboard.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.rank === 1 ? 'bg-yellow-50 border border-yellow-200' :
                        entry.rank === 2 ? 'bg-gray-50 border border-gray-200' :
                        entry.rank === 3 ? 'bg-amber-50 border border-amber-200' :
                        'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center">
                          {entry.rank === 1 && <Trophy className="w-8 h-8 text-yellow-500" />}
                          {entry.rank === 2 && <Medal className="w-8 h-8 text-gray-400" />}
                          {entry.rank === 3 && <Medal className="w-8 h-8 text-amber-600" />}
                          {entry.rank > 3 && <span className="text-xl font-bold text-gray-500">#{entry.rank}</span>}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {entry.isAnonymous ? 'Anonymous Donor' : entry.user.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {entry.totalItems} item donations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-600">
                          NPR {Number(entry.totalAmount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">total contributed</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
