import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  distance: number;
  date: string;
  mode: string;
}

interface LeaderboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardPanel({
  isOpen,
  onClose,
}: LeaderboardPanelProps): React.JSX.Element | null {
  const [selectedTab, setSelectedTab] = useState<
    'daily' | 'weekly' | 'allTime'
  >('daily');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (
      isOpen &&
      (
        window as unknown as {
          leaderboard?: { get: (tab: string) => LeaderboardEntry[] };
        }
      ).leaderboard
    ) {
      const data = (
        window as unknown as {
          leaderboard: { get: (tab: string) => LeaderboardEntry[] };
        }
      ).leaderboard.get(selectedTab);
      setEntries(data || []);
    }
  }, [isOpen, selectedTab]);

  if (!isOpen) return null;

  const tabs = [
    { key: 'daily' as const, label: '📅 Daily', emoji: '🌅' },
    { key: 'weekly' as const, label: '📆 Weekly', emoji: '⭐' },
    { key: 'allTime' as const, label: '🏆 All Time', emoji: '👑' },
  ];

  return (
    <div
      id="leaderboardPanel"
      className="fixed inset-0 flex items-center justify-center pointer-events-auto game-bg-overlay z-50"
    >
      <div className="otter-panel w-full max-w-2xl max-h-[80vh] overflow-hidden splash-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="otter-subtitle">🏆 Leaderboard</h2>
          <button
            id="leaderboardCloseButton"
            onClick={onClose}
            className="text-2xl hover:scale-110 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`leaderboard${tab.key}Tab`}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                selectedTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard entries */}
        <div className="overflow-y-auto max-h-96 space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🦦</div>
              <p className="text-lg">No scores yet!</p>
              <p className="text-sm">Be the first to set a record.</p>
            </div>
          ) : (
            entries.map((entry, index) => {
              const isTop3 = entry.rank <= 3;
              const medals = ['🥇', '🥈', '🥉'];
              const bgColors = [
                'bg-yellow-900/30',
                'bg-gray-600/30',
                'bg-orange-900/30',
              ];

              return (
                <div
                  key={`${entry.rank}-${index}`}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    isTop3 ? bgColors[entry.rank - 1] : 'bg-gray-800/50'
                  } hover:bg-gray-700/50 transition-colors`}
                >
                  {/* Rank */}
                  <div className="w-12 text-center">
                    {isTop3 ? (
                      <span className="text-3xl">{medals[entry.rank - 1]}</span>
                    ) : (
                      <span className="text-xl font-bold text-gray-400">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Player info */}
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {entry.playerName}
                    </div>
                    <div className="text-sm text-gray-400">
                      {entry.mode.replace('_', ' ')} •{' '}
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {entry.distance.toFixed(0)}m
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Player rank */}
        {(
          window as unknown as {
            leaderboard?: {
              getPlayerRank: (playerId: number, tab: string) => number;
            };
          }
        ).leaderboard &&
          entries.length > 0 && (
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border-2 border-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  Your Rank:
                </span>
                <span className="text-lg font-bold text-yellow-400">
                  #
                  {(
                    window as unknown as {
                      leaderboard: {
                        getPlayerRank: (
                          playerId: number,
                          tab: string
                        ) => number;
                      };
                    }
                  ).leaderboard.getPlayerRank(0, selectedTab)}
                </span>
              </div>
            </div>
          )}

        {/* Close button */}
        <button
          id="leaderboardDoneButton"
          onClick={onClose}
          className="otter-btn otter-btn-primary w-full mt-4"
        >
          ✓ Done
        </button>
      </div>
    </div>
  );
}
