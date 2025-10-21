import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

interface NumberInputData {
  operation?: string;
  operationSymbol?: string;
}

function NumberInput() {
  const [number1, setNumber1] = useState<string>('');
  const [number2, setNumber2] = useState<string>('');
  const [operation, setOperation] = useState<string>('');
  const [operationSymbol, setOperationSymbol] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Listen for tool response data
    const handleToolResponse = (event: any) => {
      const data = event.detail?.structuredContent as NumberInputData;
      if (data) {
        setOperation(data.operation || '');
        setOperationSymbol(data.operationSymbol || '');
      }
    };

    window.addEventListener('openai:tool_response', handleToolResponse);
    return () => window.removeEventListener('openai:tool_response', handleToolResponse);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const num1 = parseFloat(number1);
    const num2 = parseFloat(number2);

    if (isNaN(num1) || isNaN(num2)) {
      setError('Please enter valid numbers');
      return;
    }

    if (operation === 'divide' && num2 === 0) {
      setError('Cannot divide by zero');
      return;
    }

    // Send the numbers back to ChatGPT
    if (window.openai?.widget) {
      window.openai.widget.setState({
        number1: num1,
        number2: num2,
        operation: operation
      });
    }
  };

  const getOperationName = () => {
    const names: Record<string, string> = {
      add: 'Addition',
      subtract: 'Subtraction',
      multiply: 'Multiplication',
      divide: 'Division'
    };
    return names[operation] || 'Calculation';
  };

  const getGradient = () => {
    const gradients: Record<string, string> = {
      add: 'from-green-400 to-emerald-600',
      subtract: 'from-blue-400 to-blue-600',
      multiply: 'from-purple-400 to-purple-600',
      divide: 'from-orange-400 to-orange-600'
    };
    return gradients[operation] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className={`bg-gradient-to-br ${getGradient()} rounded-2xl p-8 shadow-xl`}>
        <div className="text-white mb-6 text-center">
          <h2 className="text-3xl font-bold mb-2">{getOperationName()}</h2>
          <div className="text-5xl font-bold opacity-90">{operationSymbol}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="number1" className="block text-white text-sm font-semibold mb-2">
              First Number
            </label>
            <input
              id="number1"
              type="number"
              step="any"
              value={number1}
              onChange={(e) => setNumber1(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-colors text-lg"
              placeholder="Enter first number"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-center">
            <div className="text-4xl text-white font-bold">{operationSymbol}</div>
          </div>

          <div>
            <label htmlFor="number2" className="block text-white text-sm font-semibold mb-2">
              Second Number
            </label>
            <input
              id="number2"
              type="number"
              step="any"
              value={number2}
              onChange={(e) => setNumber2(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-colors text-lg"
              placeholder="Enter second number"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-300 text-white px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-bold py-4 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg text-lg"
          >
            Calculate
          </button>
        </form>
      </div>

      <div className="mt-4 text-center text-gray-600 text-sm">
        Enter two numbers to perform {getOperationName().toLowerCase()}
      </div>
    </div>
  );
}

// Mount the component
const root = document.getElementById('widget-root');
if (root) {
  createRoot(root).render(<NumberInput />);
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    openai?: {
      widget?: {
        setState: (state: any) => void;
      };
    };
  }
}
