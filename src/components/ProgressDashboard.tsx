import { Trophy, Award, Target, Code, TrendingUp } from 'lucide-react';
import type { Achievement } from '../lib/database.types';

interface ProgressStats {
  lessonsCompleted: number;
  totalLessons: number;
  exercisesSolved: number;
  totalExercises: number;
  currentStreak: number;
}

interface ProgressDashboardProps {
  stats: ProgressStats;
  achievements: Achievement[];
  earnedAchievementIds: Set<string>;
}

export default function ProgressDashboard({
  stats,
  achievements,
  earnedAchievementIds,
}: ProgressDashboardProps) {
  const lessonsProgress = (stats.lessonsCompleted / stats.totalLessons) * 100;
  const exercisesProgress = (stats.exercisesSolved / stats.totalExercises) * 100;

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      Award: <Award size={24} />,
      Target: <Target size={24} />,
      Trophy: <Trophy size={24} />,
      Code: <Code size={24} />,
    };
    return icons[iconName] || <Award size={24} />;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
        <p className="text-gray-600">Track your learning journey and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} />
            <span className="text-3xl font-bold">{stats.lessonsCompleted}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Lessons Completed</h3>
          <div className="w-full bg-blue-400 rounded-full h-2 mb-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${lessonsProgress}%` }}
            />
          </div>
          <p className="text-blue-100 text-sm">
            {stats.lessonsCompleted} of {stats.totalLessons} lessons
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Code size={32} />
            <span className="text-3xl font-bold">{stats.exercisesSolved}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Exercises Solved</h3>
          <div className="w-full bg-green-400 rounded-full h-2 mb-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${exercisesProgress}%` }}
            />
          </div>
          <p className="text-green-100 text-sm">
            {stats.exercisesSolved} of {stats.totalExercises} exercises
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Trophy size={32} />
            <span className="text-3xl font-bold">{earnedAchievementIds.size}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Achievements</h3>
          <div className="w-full bg-orange-400 rounded-full h-2 mb-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(earnedAchievementIds.size / achievements.length) * 100}%` }}
            />
          </div>
          <p className="text-orange-100 text-sm">
            {earnedAchievementIds.size} of {achievements.length} earned
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const isEarned = earnedAchievementIds.has(achievement.id);

            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isEarned
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isEarned ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {getIcon(achievement.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {isEarned && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-700">
                        <Trophy size={12} />
                        <span>Unlocked!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
