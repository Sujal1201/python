import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Lightbulb, Play, Loader } from 'lucide-react';
import { validateExercise } from '../lib/pythonRunner';
import type { Exercise } from '../lib/database.types';

interface ExerciseViewProps {
  exercise: Exercise;
  onComplete?: () => void;
}

export default function ExerciseView({ exercise, onComplete }: ExerciseViewProps) {
  const [code, setCode] = useState(exercise.starter_code);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);

  useEffect(() => {
    setCode(exercise.starter_code);
    setValidationResult(null);
    setShowHints(false);
    setHintsRevealed(0);
  }, [exercise.id]);

  const hints = Array.isArray(exercise.hints) ? exercise.hints : [];

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const testCases = Array.isArray(exercise.test_cases) ? exercise.test_cases : [];
      const result = await validateExercise(code, testCases);
      setValidationResult(result);

      if (result.passed && onComplete) {
        onComplete();
      }
    } catch (error: any) {
      setValidationResult({
        passed: false,
        feedback: `Error: ${error.message}`,
        results: [],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{exercise.title}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty}
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed">{exercise.description}</p>

        {hints.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Lightbulb size={16} />
              {showHints ? 'Hide Hints' : `Show Hints (${hints.length})`}
            </button>

            {showHints && (
              <div className="mt-3 space-y-2">
                {hints.slice(0, hintsRevealed + 1).map((hint, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">Hint {index + 1}:</span> {hint}
                    </p>
                  </div>
                ))}
                {hintsRevealed < hints.length - 1 && (
                  <button
                    onClick={() => setHintsRevealed(hintsRevealed + 1)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Show next hint
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 p-6 bg-gray-50">
        <div className="h-full flex flex-col">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '300px' }}
            spellCheck={false}
            placeholder="# Write your code here..."
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="flex-1">
              {validationResult && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    validationResult.passed
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {validationResult.passed ? (
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        validationResult.passed ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {validationResult.feedback}
                    </p>
                    {validationResult.results && validationResult.results.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {validationResult.results.map((result: any, index: number) => (
                          <div key={index} className="text-sm">
                            {result.passed ? (
                              <span className="text-green-700">Test {index + 1}: Passed</span>
                            ) : (
                              <div className="text-red-700">
                                <div>Test {index + 1}: Failed</div>
                                {result.expected && (
                                  <div className="ml-4 text-xs mt-1">
                                    <div>Expected: {result.expected}</div>
                                    <div>Got: {result.actual || result.error}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleValidate}
              disabled={isValidating}
              className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Submit Solution
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
