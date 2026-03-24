import { useState, useEffect } from 'react';
import { Code2, BookOpen, TrendingUp, Menu, X, Search } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Lesson, Exercise, Achievement } from './lib/database.types';
import LessonNav from './components/LessonNav';
import LessonContent from './components/LessonContent';
import ProgressDashboard from './components/ProgressDashboard';
import CodeEditor from './components/CodeEditor';

type View = 'learn' | 'practice' | 'progress';

function App() {
  const [currentView, setCurrentView] = useState<View>('learn');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentLessonExercises, setCurrentLessonExercises] = useState<Exercise[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [earnedAchievementIds, setEarnedAchievementIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentLesson) {
      loadLessonExercises(currentLesson.id);
    }
  }, [currentLesson]);

  const loadData = async () => {
    try {
      const [lessonsRes, exercisesRes, achievementsRes] = await Promise.all([
        supabase.from('lessons').select('*').order('order_index'),
        supabase.from('exercises').select('*').order('order_index'),
        supabase.from('achievements').select('*'),
      ]);

      if (lessonsRes.data) {
        setLessons(lessonsRes.data);
        if (lessonsRes.data.length > 0 && !currentLesson) {
          setCurrentLesson(lessonsRes.data[0]);
        }
      }

      if (exercisesRes.data) {
        setExercises(exercisesRes.data);
      }

      if (achievementsRes.data) {
        setAchievements(achievementsRes.data);
      }

      const completed = new Set<string>();
      const savedProgress = localStorage.getItem('completedLessons');
      if (savedProgress) {
        JSON.parse(savedProgress).forEach((id: string) => completed.add(id));
      }
      setCompletedLessonIds(completed);

      const earned = new Set<string>();
      const savedAchievements = localStorage.getItem('earnedAchievements');
      if (savedAchievements) {
        JSON.parse(savedAchievements).forEach((id: string) => earned.add(id));
      }
      setEarnedAchievementIds(earned);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLessonExercises = async (lessonId: string) => {
    try {
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (data) {
        setCurrentLessonExercises(data);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const handleLessonComplete = () => {
    if (!currentLesson) return;

    const newCompleted = new Set(completedLessonIds);
    newCompleted.add(currentLesson.id);
    setCompletedLessonIds(newCompleted);
    localStorage.setItem('completedLessons', JSON.stringify([...newCompleted]));

    checkAndAwardAchievements(newCompleted.size);
  };

  const checkAndAwardAchievements = (lessonsCount: number) => {
    const newEarned = new Set(earnedAchievementIds);
    let awarded = false;

    achievements.forEach((achievement) => {
      if (earnedAchievementIds.has(achievement.id)) return;

      if (
        achievement.requirement_type === 'lessons_completed' &&
        lessonsCount >= achievement.requirement_value
      ) {
        newEarned.add(achievement.id);
        awarded = true;
      }
    });

    if (awarded) {
      setEarnedAchievementIds(newEarned);
      localStorage.setItem('earnedAchievements', JSON.stringify([...newEarned]));
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsMobileMenuOpen(false);
  };

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    lessonsCompleted: completedLessonIds.size,
    totalLessons: lessons.length,
    exercisesSolved: 0,
    totalExercises: exercises.length,
    currentStreak: 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Python Labs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Code2 className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Python Labs</h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentView('learn')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                currentView === 'learn'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={18} />
              Learn
            </button>
            <button
              onClick={() => setCurrentView('practice')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                currentView === 'practice'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Code2 size={18} />
              Practice
            </button>
            <button
              onClick={() => setCurrentView('progress')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                currentView === 'progress'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp size={18} />
              Progress
            </button>
          </nav>
        </div>

        <div className="md:hidden border-t border-gray-200 px-4 py-2 flex gap-2">
          <button
            onClick={() => {
              setCurrentView('learn');
              setIsMobileMenuOpen(false);
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
              currentView === 'learn'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 bg-gray-100'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => {
              setCurrentView('practice');
              setIsMobileMenuOpen(false);
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
              currentView === 'practice'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 bg-gray-100'
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => {
              setCurrentView('progress');
              setIsMobileMenuOpen(false);
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
              currentView === 'progress'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 bg-gray-100'
            }`}
          >
            Progress
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {currentView === 'learn' && (
          <>
            <aside
              className={`${
                isMobileMenuOpen ? 'block' : 'hidden'
              } lg:block w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto absolute lg:relative z-10 h-full`}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search lessons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <LessonNav
                lessons={filteredLessons}
                currentLessonId={currentLesson?.id}
                completedLessonIds={completedLessonIds}
                onSelectLesson={handleSelectLesson}
              />
            </aside>

            <main className="flex-1 overflow-hidden">
              {currentLesson ? (
                <LessonContent
                  lesson={currentLesson}
                  exercises={currentLessonExercises}
                  onComplete={handleLessonComplete}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Select a lesson to get started</p>
                </div>
              )}
            </main>
          </>
        )}

        {currentView === 'practice' && (
          <main className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Python Playground</h2>
                <p className="text-gray-600">
                  Practice Python freely in this interactive code editor. Write and run any Python code!
                </p>
              </div>
              <div className="h-[600px]">
                <CodeEditor initialCode="# Welcome to Python Playground!\n# Write your code here and click 'Run Code'\n\nprint('Hello, Python!')" />
              </div>
            </div>
          </main>
        )}

        {currentView === 'progress' && (
          <main className="flex-1 overflow-auto">
            <ProgressDashboard
              stats={stats}
              achievements={achievements}
              earnedAchievementIds={earnedAchievementIds}
            />
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
