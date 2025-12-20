import React, { useEffect, useState } from 'react';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'collect' | 'distance' | 'combo' | 'survival' | 'perfect';
  target: number;
  progress: number;
  completed: boolean;
  reward: {
    coins: number;
    gems: number;
    unlocks?: string[];
  };
}

interface QuestsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuestsPanel({
  isOpen,
  onClose,
}: QuestsPanelProps): React.JSX.Element | null {
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    if (isOpen && window.quests) {
      const activeQuests = window.quests.getActive();
      setQuests(activeQuests || []);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getQuestIcon = (type: Quest['type']): string => {
    switch (type) {
      case 'collect':
        return '💰';
      case 'distance':
        return '🏃';
      case 'combo':
        return '🔥';
      case 'survival':
        return '❤️';
      case 'perfect':
        return '⭐';
      default:
        return '📋';
    }
  };

  const completedCount = quests.filter((q) => q.completed).length;
  const totalCount = quests.length;

  return (
    <div
      id="questsPanel"
      className="fixed inset-0 flex items-center justify-center pointer-events-auto game-bg-overlay z-50"
    >
      <div className="otter-panel w-full max-w-2xl max-h-[80vh] overflow-hidden splash-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="otter-subtitle">📋 Daily Quests</h2>
            <p className="text-sm text-gray-400">
              {completedCount} / {totalCount} completed
            </p>
          </div>
          <button
            id="questsCloseButton"
            onClick={onClose}
            className="text-2xl hover:scale-110 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Quests list */}
        <div className="overflow-y-auto max-h-96 space-y-3">
          {quests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg">No quests available</p>
              <p className="text-sm">Check back later for new challenges!</p>
            </div>
          ) : (
            quests.map((quest) => {
              const progressPercent = Math.min(
                (quest.progress / quest.target) * 100,
                100
              );
              const isCompleted = quest.completed;

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-4xl flex-shrink-0">
                      {getQuestIcon(quest.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-white">
                            {quest.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {quest.description}
                          </p>
                        </div>
                        {isCompleted && (
                          <div className="text-2xl flex-shrink-0">✅</div>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>
                            {quest.progress.toLocaleString()} /{' '}
                            {quest.target.toLocaleString()}
                          </span>
                          <span>{progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-green-500'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <span>💰</span>
                          <span>{quest.reward.coins}</span>
                        </div>
                        {quest.reward.gems > 0 && (
                          <div className="flex items-center gap-1 text-purple-400">
                            <span>💎</span>
                            <span>{quest.reward.gems}</span>
                          </div>
                        )}
                        {quest.reward.unlocks &&
                          quest.reward.unlocks.length > 0 && (
                            <div className="flex items-center gap-1 text-blue-400">
                              <span>🎁</span>
                              <span className="text-xs">
                                {quest.reward.unlocks.join(', ')}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
          <div className="text-sm text-gray-300">
            <p className="mb-1">
              💡 <strong>Tip:</strong> Complete quests to earn coins, gems, and
              unlock special rewards!
            </p>
            <p className="text-xs text-gray-400">
              Quests reset daily at midnight.
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          id="questsDoneButton"
          onClick={onClose}
          className="otter-btn otter-btn-primary w-full mt-4"
        >
          ✓ Done
        </button>
      </div>
    </div>
  );
}
