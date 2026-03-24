import { useState, useEffect } from 'react';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';
import type { Lesson, Exercise } from '../lib/database.types';
import ExerciseView from './ExerciseView';

interface LessonContentProps {
  lesson: Lesson;
  exercises: Exercise[];
  onComplete?: () => void;
}

export default function LessonContent({ lesson, exercises, onComplete }: LessonContentProps) {
  const [activeTab, setActiveTab] = useState<'lesson' | 'exercises'>('lesson');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveTab('lesson');
    setCurrentExerciseIndex(0);
    setCompletedExercises(new Set());
  }, [lesson.id]);

  const currentExercise = exercises[currentExerciseIndex];

  const handleExerciseComplete = () => {
    setCompletedExercises(new Set([...completedExercises, currentExercise.id]));

    if (currentExerciseIndex < exercises.length - 1) {
      setTimeout(() => {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      }, 1500);
    } else if (onComplete) {
      onComplete();
    }
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-purple-100 text-purple-700';
      case 'projects':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
              <code className="font-mono text-sm">{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
      } else if (inCodeBlock) {
        codeBlockContent.push(line);
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold text-gray-900 mt-8 mb-4">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-gray-800 mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-semibold text-gray-800 mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="ml-6 text-gray-700 leading-relaxed">
            {line.substring(2)}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p key={index} className="text-gray-700 leading-relaxed my-2">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getTrackColor(lesson.track)}`}>
            {lesson.track}
          </span>
          <div className="flex items-center text-sm text-gray-500 gap-4">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{lesson.estimated_time} min</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={16} />
              <span>{exercises.length} exercises</span>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
        <p className="text-gray-600 mt-2">{lesson.description}</p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('lesson')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'lesson'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lesson Content
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'exercises'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Exercises ({completedExercises.size}/{exercises.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'lesson' ? (
          <div className="max-w-4xl mx-auto px-6 py-8">
            {renderMarkdownContent(lesson.content)}

            {exercises.length > 0 && (
              <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Practice?</h3>
                <p className="text-blue-800 mb-4">
                  Test your understanding with {exercises.length} hands-on {exercises.length === 1 ? 'exercise' : 'exercises'}.
                </p>
                <button
                  onClick={() => setActiveTab('exercises')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Start Exercises
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full">
            {exercises.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {exercises.map((ex, index) => (
                        <button
                          key={ex.id}
                          onClick={() => setCurrentExerciseIndex(index)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            index === currentExerciseIndex
                              ? 'bg-blue-600 text-white'
                              : completedExercises.has(ex.id)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      Exercise {currentExerciseIndex + 1} of {exercises.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  {currentExercise && (
                    <ExerciseView
                      key={currentExercise.id}
                      exercise={currentExercise}
                      onComplete={handleExerciseComplete}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No exercises available for this lesson.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
