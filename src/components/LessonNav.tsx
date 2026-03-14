import { CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Lesson } from '../lib/database.types';

interface LessonNavProps {
  lessons: Lesson[];
  currentLessonId?: string;
  completedLessonIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
}

export default function LessonNav({
  lessons,
  currentLessonId,
  completedLessonIds,
  onSelectLesson,
}: LessonNavProps) {
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(
    new Set(['beginner', 'intermediate', 'advanced', 'projects'])
  );

  const lessonsByTrack = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.track]) {
      acc[lesson.track] = [];
    }
    acc[lesson.track].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  Object.keys(lessonsByTrack).forEach((track) => {
    lessonsByTrack[track].sort((a, b) => a.order_index - b.order_index);
  });

  const toggleTrack = (track: string) => {
    const newExpanded = new Set(expandedTracks);
    if (newExpanded.has(track)) {
      newExpanded.delete(track);
    } else {
      newExpanded.add(track);
    }
    setExpandedTracks(newExpanded);
  };

  const getTrackInfo = (track: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string }> = {
      beginner: { label: 'Beginner Track', color: 'text-green-700', bgColor: 'bg-green-50' },
      intermediate: { label: 'Intermediate Track', color: 'text-blue-700', bgColor: 'bg-blue-50' },
      advanced: { label: 'Advanced Track', color: 'text-purple-700', bgColor: 'bg-purple-50' },
      projects: { label: 'Project Labs', color: 'text-orange-700', bgColor: 'bg-orange-50' },
    };
    return configs[track] || { label: track, color: 'text-gray-700', bgColor: 'bg-gray-50' };
  };

  const trackOrder = ['beginner', 'intermediate', 'advanced', 'projects'];
  const sortedTracks = Object.keys(lessonsByTrack).sort(
    (a, b) => trackOrder.indexOf(a) - trackOrder.indexOf(b)
  );

  return (
    <div className="h-full overflow-y-auto bg-white border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Course Content</h2>

        <div className="space-y-2">
          {sortedTracks.map((track) => {
            const trackInfo = getTrackInfo(track);
            const trackLessons = lessonsByTrack[track];
            const isExpanded = expandedTracks.has(track);
            const completedCount = trackLessons.filter((l) => completedLessonIds.has(l.id)).length;

            return (
              <div key={track} className="rounded-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => toggleTrack(track)}
                  className={`w-full px-4 py-3 flex items-center justify-between ${trackInfo.bgColor} hover:opacity-80 transition-opacity`}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span className={`font-semibold ${trackInfo.color}`}>{trackInfo.label}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {completedCount}/{trackLessons.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="bg-white">
                    {trackLessons.map((lesson, index) => {
                      const isCompleted = completedLessonIds.has(lesson.id);
                      const isActive = lesson.id === currentLessonId;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson)}
                          className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors border-t border-gray-100 ${
                            isActive
                              ? 'bg-blue-50 border-l-4 border-l-blue-600'
                              : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {isCompleted ? (
                              <CheckCircle size={18} className="text-green-600" />
                            ) : (
                              <Circle size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-500">
                                {index + 1}
                              </span>
                              <h3
                                className={`text-sm font-medium truncate ${
                                  isActive ? 'text-blue-900' : 'text-gray-900'
                                }`}
                              >
                                {lesson.title}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{lesson.estimated_time} min</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
