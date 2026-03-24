declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadPyodide: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideInstance: any = null;
let isLoading = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loadPromise: Promise<any> | null = null;

export async function loadPyodide() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });

      return pyodideInstance;
    } catch (error) {
      isLoading = false;
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
}

export async function runPythonCode(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  let output = '';
  let error: string | null = null;

  try {
    const pyodide = await loadPyodide();

    pyodide.runPython(`
      import sys
      from io import StringIO
      sys.stdout = StringIO()
      sys.stderr = StringIO()
    `);

    try {
      await pyodide.runPythonAsync(code);

      output = pyodide.runPython('sys.stdout.getvalue()');
      const errorOutput = pyodide.runPython('sys.stderr.getvalue()');

      if (errorOutput) {
        error = errorOutput;
      }
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : String(err);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    error = `Failed to initialize Python: ${message}`;
  }

  const executionTime = performance.now() - startTime;

  return { output, error, executionTime };
}

export async function validateExercise(
  code: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCases: any[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ passed: boolean; feedback: string; results: any[] }> {
  const results = [];
  let allPassed = true;

  try {
    const pyodide = await loadPyodide();

    for (const testCase of testCases) {
      if (testCase.expected_output !== undefined) {
        pyodide.runPython(`
          import sys
          from io import StringIO
          sys.stdout = StringIO()
          sys.stderr = StringIO()
        `);

        try {
          await pyodide.runPythonAsync(code);
          const output = pyodide.runPython('sys.stdout.getvalue()');
          const passed = output === testCase.expected_output;

          results.push({
            passed,
            expected: testCase.expected_output,
            actual: output,
          });

          if (!passed) allPassed = false;
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          results.push({
            passed: false,
            expected: testCase.expected_output,
            error: errorMessage,
          });
          allPassed = false;
        }
      } else if (testCase.expected_contains !== undefined) {
        pyodide.runPython(`
          import sys
          from io import StringIO
          sys.stdout = StringIO()
        `);

        await pyodide.runPythonAsync(code);
        const output = pyodide.runPython('sys.stdout.getvalue()');
        const passed = output.length > 0;

        results.push({
          passed,
          message: passed ? 'Output generated' : 'No output',
        });

        if (!passed) allPassed = false;
      } else if (testCase.check_variables) {
        try {
          await pyodide.runPythonAsync(code);

          let allVarsCorrect = true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const varResults: any = {};

          for (const [varName, expectedType] of Object.entries(testCase.check_variables as Record<string, string>)) {
            try {
              const varValue = pyodide.globals.get(varName);
              const actualType = typeof varValue === 'number'
                ? (Number.isInteger(varValue) ? 'int' : 'float')
                : typeof varValue === 'string' ? 'str'
                : typeof varValue === 'boolean' ? 'bool'
                : 'unknown';

              const typeMatch = actualType === expectedType;
              varResults[varName] = { exists: true, type: actualType, correct: typeMatch };

              if (!typeMatch) allVarsCorrect = false;
            } catch {
              varResults[varName] = { exists: false, correct: false };
              allVarsCorrect = false;
            }
          }

          results.push({
            passed: allVarsCorrect,
            variables: varResults,
          });

          if (!allVarsCorrect) allPassed = false;
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          results.push({
            passed: false,
            error: errorMessage,
          });
          allPassed = false;
        }
      }
    }

    const feedback = allPassed
      ? 'All tests passed!'
      : 'Some tests failed. Check the results below.';

    return { passed: allPassed, feedback, results };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      feedback: `Error running tests: ${errorMessage}`,
      results,
    };
  }
}
