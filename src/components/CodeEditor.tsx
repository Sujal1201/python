import { useState, useEffect } from 'react';
import { Play, RotateCcw, Loader } from 'lucide-react';
import { runPythonCode, ExecutionResult } from '../lib/pythonRunner';

interface CodeEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ initialCode = '', onCodeChange, readOnly = false }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);

    try {
      const result = await runPythonCode(code);
      setOutput(result);
    } catch (error: any) {
      setOutput({
        output: '',
        error: error.message || 'An error occurred',
        executionTime: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium ml-2">Python Editor</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1 transition-colors"
            disabled={isRunning || readOnly}
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || readOnly}
            className="px-4 py-1 bg-green-600 hover:bg-green-500 rounded text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <Loader size={14} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={14} />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 relative">
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            readOnly={readOnly}
            className="w-full h-full p-4 font-mono text-sm bg-gray-50 resize-none focus:outline-none focus:bg-white"
            style={{ minHeight: '300px' }}
            spellCheck={false}
            placeholder="# Write your Python code here..."
          />
        </div>

        {output && (
          <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200">
            <div className="h-full flex flex-col">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Output</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({output.executionTime.toFixed(0)}ms)
                </span>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                {output.error ? (
                  <div className="text-red-600 font-mono text-sm whitespace-pre-wrap">
                    {output.error}
                  </div>
                ) : (
                  <div className="font-mono text-sm whitespace-pre-wrap">
                    {output.output || <span className="text-gray-400">No output</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
